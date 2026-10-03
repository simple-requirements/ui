import { Column } from 'primereact/column';
import { DataTable, type DataTableRowClickEvent, type DataTableSelectionSingleChangeEvent } from 'primereact/datatable';
import type { MouseEvent, ReactNode } from 'react';

import { formatNullableValue } from '@/pages/ProjectRequirements/List/requirementFormatters';
import {
    getRequirementColumnPassThrough,
    getRequirementRowClassName,
} from '@/pages/ProjectRequirements/List/requirementListTableUtils';
import type { RequirementTableRow } from '@/pages/ProjectRequirements/List/requirementListTypes';
import { isRequirementTableRow } from '@/pages/ProjectRequirements/List/requirementListTypes';
import { RequirementDescription } from '@/pages/ProjectRequirements/RequirementDescription';
import { RequirementStatusBadge } from '@/pages/ProjectRequirements/RequirementStatusBadge';

export type RequirementTableProps = Readonly<{
    requirements: readonly RequirementTableRow[];
    selectedRequirement: RequirementTableRow | undefined;
    selectedRequirementId: string | undefined;
    onSelectRequirement: (requirementId: string) => void;
    onCopyRequirementKey: (requirement: RequirementTableRow) => void;
    onOpenRequirement: (requirement: RequirementTableRow) => void;
    onOpenRequirementReview: (requirement: RequirementTableRow) => void;
    categoriesById: ReadonlyMap<string, Readonly<{ name: string; type: string }>>;
    pendingReviewRequirementIds: ReadonlySet<string>;
}>;

function descriptionBodyTemplate(requirement: RequirementTableRow): ReactNode {
    return (
        <RequirementDescription
            requirement={requirement}
            stopNavigationPropagation
        />
    );
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

function statusBodyTemplate(requirement: RequirementTableRow): ReactNode {
    return <RequirementStatusBadge status={requirement.status} />;
}

function updatedAtBodyTemplate(requirement: RequirementTableRow): string {
    return new Date(requirement.updatedAt).toLocaleString();
}

export function RequirementTable({
    requirements,
    selectedRequirement,
    selectedRequirementId,
    onSelectRequirement,
    onCopyRequirementKey,
    onOpenRequirement,
    onOpenRequirementReview,
    categoriesById,
    pendingReviewRequirementIds,
}: RequirementTableProps) {
    function handleRequirementSelectionChange(event: DataTableSelectionSingleChangeEvent<RequirementTableRow[]>): void {
        if (isRequirementTableRow(event.value)) {
            onSelectRequirement(event.value.id);
        }
    }

    function handleRequirementRowClick(event: DataTableRowClickEvent): void {
        if (isRequirementTableRow(event.data)) {
            onSelectRequirement(event.data.id);
        }
    }

    function handleRequirementRowDoubleClick(event: DataTableRowClickEvent): void {
        if (isRequirementTableRow(event.data)) {
            onOpenRequirement(event.data);
        }
    }

    function handleRequirementKeyClick(event: MouseEvent<HTMLButtonElement>, requirement: RequirementTableRow): void {
        event.stopPropagation();
        onSelectRequirement(requirement.id);
        onCopyRequirementKey(requirement);
    }

    function handleReviewClick(event: MouseEvent<HTMLButtonElement>, requirement: RequirementTableRow): void {
        event.stopPropagation();
        onOpenRequirementReview(requirement);
    }

    function typeBodyTemplate(requirement: RequirementTableRow): string {
        return categoriesById.get(requirement.categoryId)?.type ?? requirement.visibleKey.split('-')[0];
    }

    function categoryBodyTemplate(requirement: RequirementTableRow): string {
        return categoriesById.get(requirement.categoryId)?.name ?? '—';
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

    function reviewBodyTemplate(requirement: RequirementTableRow): ReactNode {
        if (!pendingReviewRequirementIds.has(requirement.id)) return null;

        return (
            <button
                type='button'
                className='project-requirements-list-page__review-button'
                aria-label='Review this requirement'
                title='Review this requirement'
                onClick={(event) => handleReviewClick(event, requirement)}>
                <i
                    className='pi pi-eye'
                    aria-hidden='true'
                />
            </button>
        );
    }

    return (
        <DataTable
            value={[...requirements]}
            dataKey='id'
            selectionMode='single'
            metaKeySelection={false}
            selection={selectedRequirement}
            onSelectionChange={handleRequirementSelectionChange}
            onRowClick={handleRequirementRowClick}
            onRowDoubleClick={handleRequirementRowDoubleClick}
            rowClassName={(requirement) => getRequirementRowClassName(requirement, selectedRequirementId)}
            pt={{
                root: { className: 'project-requirements-list-page__data-table' },
                wrapper: { className: 'project-requirements-list-page__data-table-wrapper' },
                table: { 'className': 'project-requirements-list-page__table', 'aria-label': 'Requirements' },
            }}
            scrollable
            scrollHeight='flex'>
            <Column
                field='visibleKey'
                header='Key'
                body={keyBodyTemplate}
                sortable
                pt={getRequirementColumnPassThrough('project-requirements-list-page__key-column')}
            />
            <Column
                header='Description'
                body={descriptionBodyTemplate}
                pt={getRequirementColumnPassThrough('project-requirements-list-page__description-column')}
            />
            <Column
                header='Type'
                body={typeBodyTemplate}
                sortable
                sortField='visibleKey'
                pt={getRequirementColumnPassThrough('project-requirements-list-page__type-column')}
            />
            <Column
                header='Category'
                body={categoryBodyTemplate}
                pt={getRequirementColumnPassThrough('project-requirements-list-page__category-column')}
            />
            <Column
                header='Status'
                body={statusBodyTemplate}
                sortable
                field='status'
                pt={getRequirementColumnPassThrough('project-requirements-list-page__status-column')}
            />
            <Column
                header='Priority'
                body={priorityBodyTemplate}
                sortable
                field='priority'
                pt={getRequirementColumnPassThrough('project-requirements-list-page__priority-column')}
            />
            <Column
                header='Owner'
                body={ownerBodyTemplate}
                sortable
                field='owner'
                pt={getRequirementColumnPassThrough('project-requirements-list-page__owner-column')}
            />
            <Column
                header='Reviewer'
                body={reviewerBodyTemplate}
                pt={getRequirementColumnPassThrough('project-requirements-list-page__reviewer-column')}
            />
            <Column
                header='Updated'
                body={updatedAtBodyTemplate}
                sortable
                field='updatedAt'
                pt={getRequirementColumnPassThrough('project-requirements-list-page__updated-column')}
            />
            <Column
                header='Review'
                body={reviewBodyTemplate}
                pt={getRequirementColumnPassThrough('project-requirements-list-page__review-action-column')}
            />
        </DataTable>
    );
}
