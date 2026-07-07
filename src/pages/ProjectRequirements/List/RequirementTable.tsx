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
import { RequirementStatusBadge } from '@/pages/ProjectRequirements/RequirementStatusBadge';

export type RequirementTableProps = Readonly<{
    requirements: readonly RequirementTableRow[];
    selectedRequirement: RequirementTableRow | undefined;
    selectedRequirementId: string | undefined;
    onSelectRequirement: (requirementId: string) => void;
    onCopyRequirementKey: (requirement: RequirementTableRow) => void;
    onOpenRequirement: (requirement: RequirementTableRow) => void;
}>;

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
                table: { className: 'project-requirements-list-page__table' },
            }}
            scrollable
            scrollHeight='flex'>
            <Column
                field='visibleKey'
                header='Key'
                body={keyBodyTemplate}
                pt={getRequirementColumnPassThrough('project-requirements-list-page__key-column')}
            />

            <Column
                header='Description'
                body={descriptionBodyTemplate}
                pt={getRequirementColumnPassThrough('project-requirements-list-page__description-column')}
            />

            <Column
                header='Status'
                body={statusBodyTemplate}
                pt={getRequirementColumnPassThrough('project-requirements-list-page__status-column')}
            />

            <Column
                header='Priority'
                body={priorityBodyTemplate}
                pt={getRequirementColumnPassThrough('project-requirements-list-page__priority-column')}
            />

            <Column
                header='Owner'
                body={ownerBodyTemplate}
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
                pt={getRequirementColumnPassThrough('project-requirements-list-page__updated-column')}
            />
        </DataTable>
    );
}
