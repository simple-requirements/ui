import { useSelector } from '@tanstack/react-store';
import { useQuery } from '@tanstack/react-query';
import type { ContextMenu } from 'primereact/contextmenu';
import type { MenuItem } from 'primereact/menuitem';
import { type MouseEvent, useEffect, useRef, useState } from 'react';

import {
    getRequirementRevisionsQueryKey,
    listRequirementRevisionsRequest,
    type Requirement,
} from '@/api/requirementsApi';
import { AppContextMenu } from '@/components/ContextMenu/AppContextMenu';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { RevisionComparisonDialog } from '@/pages/ProjectRequirements/RevisionComparisonDialog';
import {
    actionBarStore,
    closeRevisionComparisonDialog,
    openRevisionComparisonDialog,
    setRevisionComparisonAvailable,
} from '@/stores/actionBarStore';
import { formatDateTime } from '@/utils/displayFormatters';

import '@/pages/ProjectRequirements/RevisionHistoryPanel.scss';

type RevisionHistoryPanelProps = Readonly<{
    projectId: string;
    requirementId: string;
    currentRevisionNumber: number;
    onSelectRevision: (revision: Requirement) => void;
}>;

type RevisionComparisonPair = readonly [number, number];

function formatChangeType(changeType: string): string {
    const normalized = changeType.replaceAll('_', ' ');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function toggleRevisionSelection(selectedRevisionNumbers: number[], revisionNumber: number): number[] {
    if (selectedRevisionNumbers.includes(revisionNumber)) {
        return selectedRevisionNumbers.length === 1 ?
                selectedRevisionNumbers
            :   selectedRevisionNumbers.filter((selectedRevisionNumber) => selectedRevisionNumber !== revisionNumber);
    }

    return [...selectedRevisionNumbers.slice(-1), revisionNumber];
}

function RevisionHistoryTable({
    revisions,
    selectedRevisionNumbers,
    onSelectRevision,
    onOpenContextMenu,
}: Readonly<{
    revisions: Requirement[];
    selectedRevisionNumbers: readonly number[];
    onSelectRevision: (revision: Requirement, extendSelection: boolean) => void;
    onOpenContextMenu: (revision: Requirement, event: MouseEvent<HTMLTableRowElement>) => void;
}>) {
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
                    {[...revisions].reverse().map((revision) => {
                        const selected = selectedRevisionNumbers.includes(revision.revisionNumber);
                        return (
                            <tr
                                key={revision.revisionNumber}
                                className={selected ? 'revision-history-panel__row--selected' : undefined}
                                aria-selected={selected}
                                onClick={(event) => onSelectRevision(revision, event.ctrlKey)}
                                onContextMenu={(event) => onOpenContextMenu(revision, event)}>
                                <td>
                                    <span className='revision-history-panel__revision'>
                                        Revision {String(revision.revisionNumber)}
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
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/** Displays and browses immutable revisions for a requirement inside its detail view. */
export function RevisionHistoryPanel({
    projectId,
    requirementId,
    currentRevisionNumber,
    onSelectRevision,
}: RevisionHistoryPanelProps) {
    const revisionsQuery = useQuery({
        queryKey: getRequirementRevisionsQueryKey(projectId, requirementId),
        queryFn: () => listRequirementRevisionsRequest(projectId, requirementId),
    });
    const comparisonDialogOpen = useSelector(actionBarStore, (state) => state.revisionComparisonDialogOpen ?? false);
    const contextMenuRef = useRef<ContextMenu | null>(null);
    const [selectedRevisionNumbers, setSelectedRevisionNumbers] = useState<number[]>([currentRevisionNumber]);
    const [comparisonPair, setComparisonPair] = useState<RevisionComparisonPair>();
    const revisions = revisionsQuery.data ?? [];
    const comparisonAvailable = revisions.length >= 2;

    useEffect(() => {
        setRevisionComparisonAvailable(comparisonAvailable);
        return () => setRevisionComparisonAvailable(false);
    }, [comparisonAvailable]);

    function selectRevision(revision: Requirement, extendSelection: boolean): void {
        const nextSelectedRevisionNumbers =
            extendSelection ?
                toggleRevisionSelection(selectedRevisionNumbers, revision.revisionNumber)
            :   [revision.revisionNumber];

        setSelectedRevisionNumbers(nextSelectedRevisionNumbers);
        setComparisonPair(undefined);

        const nextDisplayedRevisionNumber =
            nextSelectedRevisionNumbers.includes(revision.revisionNumber) ?
                revision.revisionNumber
            :   nextSelectedRevisionNumbers.at(-1);
        const nextDisplayedRevision = revisions.find(
            (candidate) => candidate.revisionNumber === nextDisplayedRevisionNumber,
        );
        if (nextDisplayedRevision !== undefined) {
            onSelectRevision(nextDisplayedRevision);
        }
    }

    function openContextMenu(revision: Requirement, event: MouseEvent<HTMLTableRowElement>): void {
        if (selectedRevisionNumbers.length !== 2 || !selectedRevisionNumbers.includes(revision.revisionNumber)) {
            return;
        }

        event.preventDefault();
        contextMenuRef.current?.show(event);
    }

    function compareSelectedRevisions(): void {
        if (selectedRevisionNumbers.length !== 2) {
            return;
        }

        const orderedPair = [...selectedRevisionNumbers].sort((left, right) => left - right) as [number, number];
        setComparisonPair(orderedPair);
        openRevisionComparisonDialog();
    }

    const contextMenuItems: MenuItem[] = [
        { label: 'Compare revisions', icon: 'pi pi-clone', command: compareSelectedRevisions },
    ];

    return (
        <section
            className='revision-history-panel ui-panel ui-panel--padded'
            aria-labelledby='revision-history-panel-title'>
            <AppContextMenu
                ref={contextMenuRef}
                model={contextMenuItems}
            />

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
                    selectedRevisionNumbers={selectedRevisionNumbers}
                    onSelectRevision={selectRevision}
                    onOpenContextMenu={openContextMenu}
                />
            </LoadableContent>

            {comparisonAvailable && (
                <RevisionComparisonDialog
                    projectId={projectId}
                    requirementId={requirementId}
                    revisions={revisions}
                    initialRevisionNumbers={comparisonPair}
                    visible={comparisonDialogOpen}
                    onHide={() => {
                        setComparisonPair(undefined);
                        closeRevisionComparisonDialog();
                    }}
                />
            )}
        </section>
    );
}
