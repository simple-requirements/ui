/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Column } from 'primereact/column';
import { DataTable, type DataTableRowClickEvent, type DataTableRowDoubleClickEvent } from 'primereact/datatable';
import type { DemoRequirement } from '@/demo/demoTypes';
import type { Action } from '@/state/workspaceReducer';

type RequirementsListProps = Readonly<{
    requirements: readonly DemoRequirement[];
    selectedRequirementId: string | null;
    dispatch: (action: Action) => void;
}>;

export function RequirementsList({ requirements, selectedRequirementId, dispatch }: RequirementsListProps) {
    function selectRequirement(requirement: DemoRequirement) {
        dispatch({ type: 'selectRequirement', requirementId: requirement.id });
    }

    function openRequirement(requirement: DemoRequirement) {
        dispatch({ type: 'openRequirementTab', requirementId: requirement.id, visibleKey: requirement.visibleKey });
    }

    return (
        <DataTable
            value={[...requirements]}
            dataKey="id"
            className="req-list"
            rowClassName={(requirement) => (requirement.id === selectedRequirementId ? 'selected' : '')}
            onRowClick={(event: DataTableRowClickEvent) => selectRequirement(event.data as DemoRequirement)}
            onRowDoubleClick={(event: DataTableRowDoubleClickEvent) => openRequirement(event.data as DemoRequirement)}
            tableProps={{ 'aria-label': 'Requirements' }}
        >
            <Column field="visibleKey" header="Visible key" />
            <Column field="categoryKey" header="Category" />
            <Column field="type" header="Type" />
            <Column field="status" header="Status" />
            <Column field="priority" header="Priority" />
            <Column field="owner" header="Owner" body={(requirement: DemoRequirement) => requirement.owner ?? '—'} />
        </DataTable>
    );
}
