import { Column } from 'primereact/column';
import { DataTable, type DataTableRowClickEvent } from 'primereact/datatable';
import type { DemoRequirement } from '@/demo/demoTypes';
import type { Action } from '@/state/workspaceReducer';

type RequirementsListProps = Readonly<{
    requirements: readonly DemoRequirement[];
    selectedRequirementId: string | null;
    dispatch: (action: Action) => void;
}>;

export function RequirementsList({ requirements, selectedRequirementId, dispatch }: RequirementsListProps) {
    const selectRequirement = (requirement: DemoRequirement) => {
        dispatch({ type: 'selectRequirement', requirementId: requirement.id });
    };

    const openRequirement = (requirement: DemoRequirement) => {
        dispatch({ type: 'openRequirementTab', requirementId: requirement.id, visibleKey: requirement.visibleKey });
    };

    const handleRowClick = (event: DataTableRowClickEvent) => {
        selectRequirement(event.data as DemoRequirement);
    };

    const handleRowDoubleClick = (event: DataTableRowClickEvent) => {
        openRequirement(event.data as DemoRequirement);
    };

    return (
        <DataTable
            value={[...requirements]}
            dataKey="id"
            className="requirements-list req-list"
            rowClassName={(requirement: DemoRequirement) =>
                requirement.id === selectedRequirementId ? 'requirements-list__row--selected selected' : ''
            }
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
            aria-label="Requirements"
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
