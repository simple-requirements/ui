import { DiffModeEnum, DiffView } from '@git-diff-view/react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from 'primereact/dialog';
import { useState, type ReactNode } from 'react';

import '@git-diff-view/react/styles/diff-view.css';

import {
    compareRequirementRevisionsRequest,
    getRequirementRevisionComparisonQueryKey,
    type Requirement,
    type RequirementRevisionDifference,
} from '@/api/requirementsApi';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { formatDateTime } from '@/utils/displayFormatters';

import '@/pages/ProjectRequirements/RevisionComparisonDialog.scss';

type RevisionComparisonDialogProps = Readonly<{
    projectId: string;
    requirementId: string;
    revisions: Requirement[];
    visible: boolean;
    onHide: () => void;
}>;

type ComparableField =
    | 'categoryId'
    | 'sequenceNumber'
    | 'visibleKey'
    | 'status'
    | 'priority'
    | 'owner'
    | 'rationale'
    | 'source'
    | 'rejectionReason'
    | 'reviewer'
    | 'obsoletedBy'
    | 'implementationTickets'
    | 'approvedAt'
    | 'implementedAt'
    | 'obsolescenceReason'
    | 'obsoleteAt'
    | 'rejectedAt';

const comparisonFields: readonly ComparableField[] = [
    'categoryId',
    'sequenceNumber',
    'visibleKey',
    'status',
    'priority',
    'owner',
    'rationale',
    'source',
    'rejectionReason',
    'reviewer',
    'obsoletedBy',
    'implementationTickets',
    'approvedAt',
    'implementedAt',
    'obsolescenceReason',
    'obsoleteAt',
    'rejectedAt',
];

const fieldLabels: Readonly<Record<ComparableField, string>> = {
    categoryId: 'Category',
    sequenceNumber: 'Sequence number',
    visibleKey: 'Key',
    status: 'Status',
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

const dateTimeFields = new Set<ComparableField>(['approvedAt', 'implementedAt', 'obsoleteAt', 'rejectedAt']);

function formatSimpleValue(field: ComparableField, value: string | number | boolean | null): string {
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
        return <li key={String(index)}>{JSON.stringify(ticket)}</li>;
    }

    const record = ticket as Record<string, unknown>;
    const ticketId = typeof record.ticketId === 'string' ? record.ticketId : `Ticket ${String(index + 1)}`;
    const completedBy = typeof record.completedBy === 'string' ? record.completedBy : undefined;
    const completedAt = typeof record.completedAt === 'string' ? record.completedAt : undefined;
    const details = [completedBy, completedAt].filter((value): value is string => value !== undefined).join(' · ');

    return <li key={`${ticketId}-${String(index)}`}>{details.length === 0 ? ticketId : `${ticketId} — ${details}`}</li>;
}

function renderFieldValue(field: ComparableField, value: Requirement[ComparableField]): ReactNode {
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return '—';
        }
        return <ul className='revision-comparison-dialog__ticket-list'>{value.map(formatTicket)}</ul>;
    }
    if (typeof value === 'object' && value !== null) {
        return <pre className='revision-comparison-dialog__structured-value'>{JSON.stringify(value, null, 2)}</pre>;
    }
    return formatSimpleValue(field, value);
}

type DiffOperation = Readonly<{ prefix: ' ' | '+' | '-'; line: string }>;

function splitLines(content: string): string[] {
    return content.length === 0 ? [] : content.split('\n');
}

function buildDiffOperations(oldLines: string[], newLines: string[]): DiffOperation[] {
    const lengths = Array.from({ length: oldLines.length + 1 }, () => Array<number>(newLines.length + 1).fill(0));

    for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex -= 1) {
        for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex -= 1) {
            lengths[oldIndex][newIndex] =
                oldLines[oldIndex] === newLines[newIndex] ?
                    lengths[oldIndex + 1][newIndex + 1] + 1
                :   Math.max(lengths[oldIndex + 1][newIndex], lengths[oldIndex][newIndex + 1]);
        }
    }

    const operations: DiffOperation[] = [];
    let oldIndex = 0;
    let newIndex = 0;
    while (oldIndex < oldLines.length && newIndex < newLines.length) {
        if (oldLines[oldIndex] === newLines[newIndex]) {
            operations.push({ prefix: ' ', line: oldLines[oldIndex] });
            oldIndex += 1;
            newIndex += 1;
        } else if (lengths[oldIndex + 1][newIndex] >= lengths[oldIndex][newIndex + 1]) {
            operations.push({ prefix: '-', line: oldLines[oldIndex] });
            oldIndex += 1;
        } else {
            operations.push({ prefix: '+', line: newLines[newIndex] });
            newIndex += 1;
        }
    }
    while (oldIndex < oldLines.length) {
        operations.push({ prefix: '-', line: oldLines[oldIndex] });
        oldIndex += 1;
    }
    while (newIndex < newLines.length) {
        operations.push({ prefix: '+', line: newLines[newIndex] });
        newIndex += 1;
    }

    return operations;
}

function buildDescriptionHunk(oldContent: string, newContent: string): string {
    const oldLines = splitLines(oldContent);
    const newLines = splitLines(newContent);
    const oldStart = oldLines.length === 0 ? '0' : '1';
    const newStart = newLines.length === 0 ? '0' : '1';
    const header = `@@ -${oldStart},${String(oldLines.length)} +${newStart},${String(newLines.length)} @@`;
    const body = buildDiffOperations(oldLines, newLines).map(({ prefix, line }) => `${prefix}${line}`);

    return [header, ...body].join('\n');
}

function DescriptionDiff({ fromRevision, toRevision }: Readonly<{ fromRevision: Requirement; toRevision: Requirement }>) {
    const fromDescription = fromRevision.description ?? '';
    const toDescription = toRevision.description ?? '';

    return (
        <section className='revision-comparison-dialog__description' aria-labelledby='revision-description-diff-title'>
            <h3 id='revision-description-diff-title'>Description</h3>
            <div className='revision-comparison-dialog__diff'>
                <DiffView
                    data={{
                        oldFile: {
                            fileName: `Revision ${String(fromRevision.revisionNumber)}`,
                            fileLang: 'text',
                            content: fromDescription,
                        },
                        newFile: {
                            fileName: `Revision ${String(toRevision.revisionNumber)}`,
                            fileLang: 'text',
                            content: toDescription,
                        },
                        hunks: [buildDescriptionHunk(fromDescription, toDescription)],
                    }}
                    diffViewMode={DiffModeEnum.Split}
                    diffViewTheme='light'
                    diffViewWrap
                />
            </div>
        </section>
    );
}

function RevisionFieldTable({
    fromRevision,
    toRevision,
    differences,
}: Readonly<{
    fromRevision: Requirement;
    toRevision: Requirement;
    differences: RequirementRevisionDifference[];
}>) {
    const changedFields = new Set(differences.map((difference) => difference.field));

    return (
        <div className='revision-comparison-dialog__table-wrapper ui-table-wrapper ui-table-wrapper--bordered'>
            <table className='revision-comparison-dialog__table ui-table ui-table--comfortable ui-table--muted-header ui-table--no-last-border'>
                <thead>
                    <tr>
                        <th scope='col'>Field</th>
                        <th scope='col'>Revision {String(fromRevision.revisionNumber)}</th>
                        <th scope='col'>Revision {String(toRevision.revisionNumber)}</th>
                    </tr>
                </thead>
                <tbody>
                    {comparisonFields.map((field) => {
                        const changed = changedFields.has(field);
                        return (
                            <tr
                                key={field}
                                className={changed ? 'revision-comparison-dialog__field--changed' : undefined}>
                                <th scope='row'>{fieldLabels[field]}</th>
                                <td>{renderFieldValue(field, fromRevision[field])}</td>
                                <td>{renderFieldValue(field, toRevision[field])}</td>
                            </tr>
                        );
                    })}
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
}: Readonly<{
    projectId: string;
    requirementId: string;
    fromRevision: Requirement;
    toRevision: Requirement;
}>) {
    const comparisonQuery = useQuery({
        queryKey: getRequirementRevisionComparisonQueryKey(
            projectId,
            requirementId,
            fromRevision.revisionNumber,
            toRevision.revisionNumber,
        ),
        queryFn: () =>
            compareRequirementRevisionsRequest(
                projectId,
                requirementId,
                fromRevision.revisionNumber,
                toRevision.revisionNumber,
            ),
    });

    return (
        <LoadableContent
            loading={comparisonQuery.isLoading}
            error={comparisonQuery.isError}
            empty={false}
            loadingMessage='Comparing revisions …'
            errorMessage='Revision comparison could not be loaded.'>
            {comparisonQuery.data !== undefined && (
                <div className='revision-comparison-dialog__result'>
                    <DescriptionDiff
                        fromRevision={fromRevision}
                        toRevision={toRevision}
                    />
                    <section aria-labelledby='revision-field-comparison-title'>
                        <h3 id='revision-field-comparison-title'>Other fields</h3>
                        <RevisionFieldTable
                            fromRevision={fromRevision}
                            toRevision={toRevision}
                            differences={comparisonQuery.data.differences}
                        />
                    </section>
                </div>
            )}
        </LoadableContent>
    );
}

/** Opens revision selection and comparison for a requirement in a modal dialog. */
export function RevisionComparisonDialog({
    projectId,
    requirementId,
    revisions,
    visible,
    onHide,
}: RevisionComparisonDialogProps) {
    const orderedRevisions = [...revisions].sort((left, right) => left.revisionNumber - right.revisionNumber);
    const defaultToRevisionNumber = orderedRevisions.at(-1)?.revisionNumber;
    const defaultFromRevisionNumber = orderedRevisions.at(-2)?.revisionNumber;
    const [selectedFromRevision, setSelectedFromRevision] = useState<number>();
    const [selectedToRevision, setSelectedToRevision] = useState<number>();
    const fromRevisionNumber = selectedFromRevision ?? defaultFromRevisionNumber;
    const toRevisionNumber = selectedToRevision ?? defaultToRevisionNumber;
    const fromRevision = orderedRevisions.find((revision) => revision.revisionNumber === fromRevisionNumber);
    const toRevision = orderedRevisions.find((revision) => revision.revisionNumber === toRevisionNumber);

    return (
        <Dialog
            visible={visible && fromRevision !== undefined && toRevision !== undefined}
            modal
            dismissableMask={false}
            draggable={false}
            resizable={false}
            header={<h2 className='revision-comparison-dialog__heading ui-dialog__heading'>Compare revisions</h2>}
            pt={{
                root: { className: 'revision-comparison-dialog ui-dialog' },
                header: { className: 'revision-comparison-dialog__header ui-dialog__header' },
                content: { className: 'revision-comparison-dialog__content ui-dialog__content' },
            }}
            onHide={onHide}>
            {fromRevision !== undefined && toRevision !== undefined && (
                <>
                    <div className='revision-comparison-dialog__selectors'>
                        <div className='ui-field'>
                            <label className='ui-label' htmlFor='revision-comparison-from'>
                                From revision
                            </label>
                            <select
                                id='revision-comparison-from'
                                className='ui-control ui-control--line'
                                value={fromRevision.revisionNumber}
                                onChange={(event) => setSelectedFromRevision(Number(event.currentTarget.value))}>
                                {orderedRevisions
                                    .filter((revision) => revision.revisionNumber !== toRevision.revisionNumber)
                                    .map((revision) => (
                                        <option key={revision.revisionNumber} value={revision.revisionNumber}>
                                            Revision {String(revision.revisionNumber)}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className='ui-field'>
                            <label className='ui-label' htmlFor='revision-comparison-to'>
                                To revision
                            </label>
                            <select
                                id='revision-comparison-to'
                                className='ui-control ui-control--line'
                                value={toRevision.revisionNumber}
                                onChange={(event) => setSelectedToRevision(Number(event.currentTarget.value))}>
                                {orderedRevisions
                                    .filter((revision) => revision.revisionNumber !== fromRevision.revisionNumber)
                                    .map((revision) => (
                                        <option key={revision.revisionNumber} value={revision.revisionNumber}>
                                            Revision {String(revision.revisionNumber)}
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
                </>
            )}
        </Dialog>
    );
}
