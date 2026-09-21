import { useQuery } from '@tanstack/react-query';

import {
    getRequirementRevisionsQueryKey,
    listRequirementRevisionsRequest,
    type Requirement,
} from '@/api/requirementsApi';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { formatDateTime } from '@/utils/displayFormatters';

import '@/pages/ProjectRequirements/RevisionHistoryPanel.scss';

type RevisionHistoryPanelProps = Readonly<{ projectId: string; requirementId: string; currentRevisionNumber: number }>;

function formatChangeType(changeType: string): string {
    const normalized = changeType.replaceAll('_', ' ');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function RevisionHistoryTable({
    revisions,
    currentRevisionNumber,
}: Readonly<{ revisions: Requirement[]; currentRevisionNumber: number }>) {
    return (
        <div className='revision-history-panel__table-wrapper ui-table-wrapper ui-table-wrapper--bordered'>
            <table className='revision-history-panel__table ui-table ui-table--comfortable ui-table--muted-header ui-table--no-last-border'>
                <thead>
                    <tr>
                        <th scope='col'>Revision</th>
                        <th scope='col'>Change</th>
                        <th scope='col'>Reason</th>
                        <th scope='col'>Changed by</th>
                        <th scope='col'>Changed at</th>
                    </tr>
                </thead>
                <tbody>
                    {[...revisions].reverse().map((revision) => (
                        <tr
                            key={revision.revisionNumber}
                            className={
                                revision.revisionNumber === currentRevisionNumber ?
                                    'revision-history-panel__row--current'
                                :   undefined
                            }>
                            <td>
                                <span className='revision-history-panel__revision'>
                                    Revision {revision.revisionNumber}
                                </span>
                            </td>
                            <td>
                                {revision.revisionNumber === 1 ?
                                    'Requirement created'
                                :   formatChangeType(revision.changeType)}
                            </td>
                            <td>{revision.changeReason}</td>
                            <td>{revision.changedByDisplayName}</td>
                            <td>
                                <time dateTime={revision.changedAt}>{formatDateTime(revision.changedAt)}</time>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/** Displays the immutable revision history for a requirement inside its detail view. */
export function RevisionHistoryPanel({ projectId, requirementId, currentRevisionNumber }: RevisionHistoryPanelProps) {
    const revisionsQuery = useQuery({
        queryKey: getRequirementRevisionsQueryKey(projectId, requirementId),
        queryFn: () => listRequirementRevisionsRequest(projectId, requirementId),
    });

    const revisions = revisionsQuery.data ?? [];

    return (
        <section
            className='revision-history-panel ui-panel ui-panel--padded'
            aria-labelledby='revision-history-panel-title'>
            <header className='revision-history-panel__header'>
                <h2
                    id='revision-history-panel-title'
                    className='revision-history-panel__title'>
                    Revision history
                </h2>
            </header>

            <LoadableContent
                loading={revisionsQuery.isLoading}
                error={revisionsQuery.isError}
                empty={revisions.length === 0}
                loadingMessage='Loading revision history …'
                errorMessage='Revision history could not be loaded.'
                emptyMessage='No revision history is available for this requirement.'>
                <RevisionHistoryTable
                    revisions={revisions}
                    currentRevisionNumber={currentRevisionNumber}
                />
            </LoadableContent>
        </section>
    );
}
