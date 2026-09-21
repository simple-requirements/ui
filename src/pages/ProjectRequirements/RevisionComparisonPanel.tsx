import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import {
    compareRequirementRevisionsRequest,
    getRequirementRevisionComparisonQueryKey,
    type Requirement,
    type RequirementRevisionDifference,
} from '@/api/requirementsApi';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { formatDateTime } from '@/utils/displayFormatters';

import '@/pages/ProjectRequirements/RevisionComparisonPanel.scss';

type RevisionComparisonPanelProps = Readonly<{ projectId: string; requirementId: string; revisions: Requirement[] }>;

const fieldLabels: Readonly<Record<string, string>> = {
    categoryId: 'Category',
    sequenceNumber: 'Sequence number',
    visibleKey: 'Key',
    status: 'Status',
    description: 'Description',
    priority: 'Priority',
    owner: 'Owner',
    rationale: 'Rationale',
    source: 'Source',
    rejectionReason: 'Rejection reason',
    reviewer: 'Reviewer',
    obsoletedBy: 'Obsoleted by',
    implementationTickets: 'Implementation tickets',
    approvedAt: 'Approved',
    implementedAt: 'Implemented',
    obsolescenceReason: 'Obsolescence reason',
    obsoleteAt: 'Obsolete',
    rejectedAt: 'Rejected',
};

const dateTimeFields = new Set(['approvedAt', 'implementedAt', 'obsoleteAt', 'rejectedAt']);

function formatFieldLabel(field: string): string {
    return (
        fieldLabels[field]
        ?? field.replaceAll(/([a-z])([A-Z])/gu, '$1 $2').replace(/^./u, (value) => value.toUpperCase())
    );
}

function formatSimpleValue(field: string, value: string | number | boolean | null): string {
    if (value === null || value === '') {
        return '—';
    }
    if (typeof value === 'string' && dateTimeFields.has(field)) {
        return formatDateTime(value);
    }
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    return String(value);
}

function formatTicket(ticket: unknown, index: number): ReactNode {
    if (typeof ticket !== 'object' || ticket === null || Array.isArray(ticket)) {
        return <li key={index}>{JSON.stringify(ticket)}</li>;
    }

    const record = ticket as Record<string, unknown>;
    const ticketId = typeof record.ticketId === 'string' ? record.ticketId : `Ticket ${index + 1}`;
    const completedBy = typeof record.completedBy === 'string' ? record.completedBy : undefined;
    const completedAt = typeof record.completedAt === 'string' ? record.completedAt : undefined;
    const details = [completedBy, completedAt].filter((value): value is string => value !== undefined).join(' · ');

    return <li key={`${ticketId}-${index}`}>{details.length === 0 ? ticketId : `${ticketId} — ${details}`}</li>;
}

function renderDifferenceValue(field: string, value: RequirementRevisionDifference['from']): ReactNode {
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return '—';
        }
        if (field === 'implementationTickets') {
            return <ul className='revision-comparison-panel__ticket-list'>{value.map(formatTicket)}</ul>;
        }
        return <pre className='revision-comparison-panel__structured-value'>{JSON.stringify(value, null, 2)}</pre>;
    }
    if (typeof value === 'object' && value !== null) {
        return <pre className='revision-comparison-panel__structured-value'>{JSON.stringify(value, null, 2)}</pre>;
    }
    return formatSimpleValue(field, value);
}

function RevisionDifferenceTable({
    differences,
    fromRevision,
    toRevision,
}: Readonly<{ differences: RequirementRevisionDifference[]; fromRevision: number; toRevision: number }>) {
    if (differences.length === 0) {
        return <p className='revision-comparison-panel__empty'>No differences between the selected revisions.</p>;
    }

    return (
        <div className='revision-comparison-panel__table-wrapper ui-table-wrapper ui-table-wrapper--bordered'>
            <table className='revision-comparison-panel__table ui-table ui-table--comfortable ui-table--muted-header ui-table--no-last-border'>
                <thead>
                    <tr>
                        <th scope='col'>Field</th>
                        <th scope='col'>Revision {fromRevision}</th>
                        <th scope='col'>Revision {toRevision}</th>
                    </tr>
                </thead>
                <tbody>
                    {differences.map((difference) => (
                        <tr key={difference.field}>
                            <th scope='row'>{formatFieldLabel(difference.field)}</th>
                            <td>{renderDifferenceValue(difference.field, difference.from)}</td>
                            <td>{renderDifferenceValue(difference.field, difference.to)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function RevisionComparisonResult({
    projectId,
    requirementId,
    fromRevision,
    toRevision,
}: Readonly<{ projectId: string; requirementId: string; fromRevision: number; toRevision: number }>) {
    const comparisonQuery = useQuery({
        queryKey: getRequirementRevisionComparisonQueryKey(projectId, requirementId, fromRevision, toRevision),
        queryFn: () => compareRequirementRevisionsRequest(projectId, requirementId, fromRevision, toRevision),
    });

    return (
        <LoadableContent
            loading={comparisonQuery.isLoading}
            error={comparisonQuery.isError}
            empty={false}
            loadingMessage='Comparing revisions …'
            errorMessage='Revision comparison could not be loaded.'>
            {comparisonQuery.data !== undefined && (
                <RevisionDifferenceTable
                    differences={comparisonQuery.data.differences}
                    fromRevision={fromRevision}
                    toRevision={toRevision}
                />
            )}
        </LoadableContent>
    );
}

/** Lets the user select two immutable revisions and shows their backend-computed field differences. */
export function RevisionComparisonPanel({ projectId, requirementId, revisions }: RevisionComparisonPanelProps) {
    const orderedRevisions = [...revisions].sort((left, right) => left.revisionNumber - right.revisionNumber);
    const defaultToRevision = orderedRevisions.at(-1)?.revisionNumber;
    const defaultFromRevision = orderedRevisions.at(-2)?.revisionNumber;
    const [selectedFromRevision, setSelectedFromRevision] = useState<number>();
    const [selectedToRevision, setSelectedToRevision] = useState<number>();
    const fromRevision = selectedFromRevision ?? defaultFromRevision;
    const toRevision = selectedToRevision ?? defaultToRevision;

    if (fromRevision === undefined || toRevision === undefined || fromRevision === toRevision) {
        return (
            <p className='revision-comparison-panel__unavailable'>
                At least two revisions are required for comparison.
            </p>
        );
    }

    return (
        <div
            className='revision-comparison-panel'
            aria-labelledby='revision-comparison-panel-title'>
            <h3
                id='revision-comparison-panel-title'
                className='revision-comparison-panel__title'>
                Compare revisions
            </h3>
            <div className='revision-comparison-panel__selectors'>
                <div className='ui-field'>
                    <label
                        className='ui-label'
                        htmlFor='revision-comparison-from'>
                        From revision
                    </label>
                    <select
                        id='revision-comparison-from'
                        className='ui-control ui-control--line'
                        value={fromRevision}
                        onChange={(event) => setSelectedFromRevision(Number(event.currentTarget.value))}>
                        {orderedRevisions
                            .filter((revision) => revision.revisionNumber !== toRevision)
                            .map((revision) => (
                                <option
                                    key={revision.revisionNumber}
                                    value={revision.revisionNumber}>
                                    Revision {revision.revisionNumber}
                                </option>
                            ))}
                    </select>
                </div>
                <div className='ui-field'>
                    <label
                        className='ui-label'
                        htmlFor='revision-comparison-to'>
                        To revision
                    </label>
                    <select
                        id='revision-comparison-to'
                        className='ui-control ui-control--line'
                        value={toRevision}
                        onChange={(event) => setSelectedToRevision(Number(event.currentTarget.value))}>
                        {orderedRevisions
                            .filter((revision) => revision.revisionNumber !== fromRevision)
                            .map((revision) => (
                                <option
                                    key={revision.revisionNumber}
                                    value={revision.revisionNumber}>
                                    Revision {revision.revisionNumber}
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            <RevisionComparisonResult
                projectId={projectId}
                requirementId={requirementId}
                fromRevision={fromRevision}
                toRevision={toRevision}
            />
        </div>
    );
}
