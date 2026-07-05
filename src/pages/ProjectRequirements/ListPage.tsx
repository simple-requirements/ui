import { useLiveQuery } from '@tanstack/react-db';
import { Column, type ColumnPassThroughOptions } from 'primereact/column';
import { DataTable, type DataTableRowClickEvent, type DataTableSelectionSingleChangeEvent } from 'primereact/datatable';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import type { MouseEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { getProjectRequirementsCollection } from '@/api/collections/projectRequirementsCollection';
import type { Requirement } from '@/api/requirementsApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { getProjectRequirementDetailsRoute } from '@/router/projectRoutes';
import { openTab } from '@/stores/tabBarStore';
import { showToastMessage } from '@/stores/toastStore';

import { RequirementDetailsPanel } from '@/pages/ProjectRequirements/RequirementDetailsPanel';

import '@/pages/ProjectRequirements/ListPage.scss';

type RequirementTableRow = Requirement & Record<string, unknown>;

function isRequirementTableRow(value: unknown): value is RequirementTableRow {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return 'id' in value && 'visibleKey' in value;
}

function getRequirementRowClassName(requirement: unknown, selectedRequirementId: string | undefined): string {
    if (isRequirementTableRow(requirement) && requirement.id === selectedRequirementId) {
        return 'project-requirements-list-page__table-row project-requirements-list-page__table-row--selected';
    }

    return 'project-requirements-list-page__table-row';
}

function formatNullableValue(value: string | null): string {
    return value ?? '—';
}

function formatStatus(status: Requirement['status']): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusBodyTemplate(requirement: RequirementTableRow): string {
    return formatStatus(requirement.status);
}

function descriptionBodyTemplate(requirement: RequirementTableRow): string {
    return formatNullableValue(requirement.description);
}

function ownerBodyTemplate(requirement: RequirementTableRow): string {
    return formatNullableValue(requirement.owner);
}

function priorityBodyTemplate(requirement: RequirementTableRow): string {
    return formatNullableValue(requirement.priority);
}

function reviewerBodyTemplate(requirement: RequirementTableRow): string {
    return formatNullableValue(requirement.reviewer);
}

function updatedAtBodyTemplate(requirement: RequirementTableRow): string {
    return new Date(requirement.updatedAt).toLocaleString();
}

function getColumnPassThrough(columnClassName?: string): ColumnPassThroughOptions {
    const cellClassNames = [columnClassName];

    return {
        headerCell: {
            className: ['project-requirements-list-page__table-header-cell', ...cellClassNames]
                .filter((className) => className !== undefined)
                .join(' '),
        },
        bodyCell: {
            className: ['project-requirements-list-page__table-body-cell', ...cellClassNames]
                .filter((className) => className !== undefined)
                .join(' '),
        },
    };
}

export function ListPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [selectedRequirementId, setSelectedRequirementId] = useState<string>();

    const requirementsCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectRequirementsCollection(projectId)),
        [projectId],
    );

    const requirementsQuery = useLiveQuery(
        (query) => {
            if (requirementsCollection === undefined) {
                return undefined;
            }

            return query.from({ requirements: requirementsCollection });
        },
        [requirementsCollection],
    );
    const requirements = useMemo<RequirementTableRow[]>(
        () => (requirementsQuery.data ?? []).map((requirement) => ({ ...requirement })),
        [requirementsQuery.data],
    );

    const selectedRequirement = useMemo(
        () => requirements.find((requirement) => requirement.id === selectedRequirementId) ?? requirements[0],
        [requirements, selectedRequirementId],
    );

    useEffect(() => {
        if (requirements.length === 0) {
            setSelectedRequirementId(undefined);

            return;
        }

        setSelectedRequirementId((currentSelectedRequirementId) => {
            const selectedRequirementStillExists = requirements.some(
                (requirement) => requirement.id === currentSelectedRequirementId,
            );

            return selectedRequirementStillExists ? currentSelectedRequirementId : requirements[0].id;
        });
    }, [requirements]);

    async function copyRequirementKey(visibleKey: string): Promise<void> {
        await navigator.clipboard.writeText(visibleKey);

        showToastMessage({
            severity: 'success',
            summary: 'Requirement key copied',
            detail: `${visibleKey} has been copied to the clipboard.`,
            life: 3000,
        });
    }

    function handleRequirementSelectionChange(event: DataTableSelectionSingleChangeEvent<RequirementTableRow[]>): void {
        if (!isRequirementTableRow(event.value)) {
            return;
        }

        setSelectedRequirementId(event.value.id);
    }

    function handleRequirementRowClick(event: DataTableRowClickEvent): void {
        if (!isRequirementTableRow(event.data)) {
            return;
        }

        setSelectedRequirementId(event.data.id);
    }

    function handleRequirementRowDoubleClick(event: DataTableRowClickEvent): void {
        if (!isRequirementTableRow(event.data) || projectId === undefined) {
            return;
        }

        const requirementDetailsRoute = getProjectRequirementDetailsRoute(projectId, event.data.id);

        setSelectedRequirementId(event.data.id);

        openTab({ id: requirementDetailsRoute, label: event.data.visibleKey, closable: true });

        void navigate(requirementDetailsRoute);
    }

    function handleRequirementKeyClick(event: MouseEvent<HTMLButtonElement>, requirement: RequirementTableRow): void {
        event.stopPropagation();

        setSelectedRequirementId(requirement.id);

        void copyRequirementKey(requirement.visibleKey);
    }

    function keyBodyTemplate(requirement: RequirementTableRow): ReactNode {
        return (
            <button
                type='button'
                className='project-requirements-list-page__key-copy-button'
                aria-label={`Copy requirement key ${requirement.visibleKey}`}
                onClick={(event) => handleRequirementKeyClick(event, requirement)}>
                {requirement.visibleKey}
            </button>
        );
    }

    if (projectId === undefined) {
        return (
            <section className='project-requirements-list-page'>
                <InlineStatus kind='error'>Project route is missing a project id.</InlineStatus>
            </section>
        );
    }

    return (
        <section
            className='project-requirements-list-page'
            aria-labelledby='project-requirements-list-page-title'>
            <Splitter
                layout='vertical'
                pt={{ root: { className: 'project-requirements-list-page__splitter' } }}>
                <SplitterPanel
                    size={67}
                    minSize={25}
                    pt={{ root: { className: 'project-requirements-list-page__splitter-panel' } }}>
                    <div className='project-requirements-list-page__list-panel'>
                        <header className='project-requirements-list-page__header'>
                            <h1
                                id='project-requirements-list-page-title'
                                className='project-requirements-list-page__title'>
                                Requirements
                            </h1>
                        </header>

                        <LoadableContent
                            loading={requirementsQuery.isLoading}
                            error={requirementsQuery.isError}
                            empty={requirements.length === 0}
                            loadingMessage='Loading requirements …'
                            errorMessage='Requirements could not be loaded.'
                            emptyMessage='No requirements available.'>
                            <DataTable
                                value={requirements}
                                dataKey='id'
                                selectionMode='single'
                                metaKeySelection={false}
                                selection={selectedRequirement}
                                onSelectionChange={handleRequirementSelectionChange}
                                onRowClick={handleRequirementRowClick}
                                onRowDoubleClick={handleRequirementRowDoubleClick}
                                rowClassName={(requirement) =>
                                    getRequirementRowClassName(requirement, selectedRequirementId)
                                }
                                pt={{
                                    root: { className: 'project-requirements-list-page__data-table' },
                                    wrapper: { className: 'project-requirements-list-page__data-table-wrapper' },
                                    table: { className: 'project-requirements-list-page__table' },
                                }}
                                scrollable
                                scrollHeight='flex'>
                                <Column
                                    field='visibleKey'
                                    header='Key'
                                    body={keyBodyTemplate}
                                    pt={getColumnPassThrough('project-requirements-list-page__key-column')}
                                />

                                <Column
                                    header='Description'
                                    body={descriptionBodyTemplate}
                                    pt={getColumnPassThrough('project-requirements-list-page__description-column')}
                                />

                                <Column
                                    header='Status'
                                    body={statusBodyTemplate}
                                    pt={getColumnPassThrough('project-requirements-list-page__status-column')}
                                />

                                <Column
                                    header='Priority'
                                    body={priorityBodyTemplate}
                                    pt={getColumnPassThrough('project-requirements-list-page__priority-column')}
                                />

                                <Column
                                    header='Owner'
                                    body={ownerBodyTemplate}
                                    pt={getColumnPassThrough('project-requirements-list-page__owner-column')}
                                />

                                <Column
                                    header='Reviewer'
                                    body={reviewerBodyTemplate}
                                    pt={getColumnPassThrough('project-requirements-list-page__reviewer-column')}
                                />

                                <Column
                                    header='Updated'
                                    body={updatedAtBodyTemplate}
                                    pt={getColumnPassThrough('project-requirements-list-page__updated-column')}
                                />
                            </DataTable>
                        </LoadableContent>
                    </div>
                </SplitterPanel>

                <SplitterPanel
                    size={33}
                    minSize={20}
                    pt={{ root: { className: 'project-requirements-list-page__splitter-panel' } }}>
                    <RequirementDetailsPanel
                        requirement={selectedRequirement}
                        title='Requirement details'
                    />
                </SplitterPanel>
            </Splitter>
        </section>
    );
}
