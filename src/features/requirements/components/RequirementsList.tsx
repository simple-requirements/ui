import { useEffect, useRef, useState } from 'react';
import { Column } from 'primereact/column';
import { ContextMenu } from 'primereact/contextmenu';
import { DataTable, type DataTableRowClickEvent } from 'primereact/datatable';
import type { MenuItem } from 'primereact/menuitem';
import type { RequirementView } from '@/types/domain';
import type { Action } from '@/state/workspaceReducer';
import type { RequirementLifecycleCommand } from '@/features/requirements/api/requirementLifecycleMutation';

type RequirementsListProps = Readonly<{
    requirements: readonly RequirementView[];
    selectedRequirementId: string | null;
    dispatch: (action: Action) => void;
    lifecyclePending?: boolean;
    onExportRequirements: (requirements: readonly RequirementView[]) => void;
    onExportAllRequirements: (requirements: readonly RequirementView[]) => void;
    onLifecycleAction?: (command: RequirementLifecycleCommand, requirement: RequirementView) => void;
}>;

/** Shows the selectable requirement table and tab-opening interactions. */
export function RequirementsList({
    requirements,
    selectedRequirementId,
    dispatch,
    lifecyclePending = false,
    onExportRequirements,
    onExportAllRequirements,
    onLifecycleAction,
}: RequirementsListProps) {
    const contextMenu = useRef<ContextMenu>(null);
    const [selectedRequirements, setSelectedRequirements] = useState<RequirementView[]>([]);
    const [contextRequirement, setContextRequirement] = useState<RequirementView | null>(null);

    useEffect(() => {
        if (!selectedRequirementId) {
            setSelectedRequirements([]);
            return;
        }
        const selectedRequirement = requirements.find((requirement) => requirement.id === selectedRequirementId);
        setSelectedRequirements(selectedRequirement ? [selectedRequirement] : []);
    }, [requirements, selectedRequirementId]);

    const selectRequirement = (requirement: RequirementView) => {
        setSelectedRequirements([requirement]);
        dispatch({ type: 'selectRequirement', requirementId: requirement.id });
    };

    const openRequirement = (requirement: RequirementView) => {
        dispatch({ type: 'openRequirementTab', requirementId: requirement.id, visibleKey: requirement.visibleKey });
    };

    const contextExportSelection = () => {
        if (!contextRequirement) return [];
        const selectedIds = new Set(selectedRequirements.map((requirement) => requirement.id));
        if (selectedIds.has(contextRequirement.id) && selectedRequirements.length > 0) return selectedRequirements;
        return [contextRequirement];
    };

    const editContextRequirement = () => {
        if (!contextRequirement || contextRequirement.status !== 'draft') return;
        dispatch({ type: 'selectRequirement', requirementId: contextRequirement.id });
        dispatch({ type: 'setMode', mode: 'editRequirement' });
    };

    const runContextLifecycleAction = (command: RequirementLifecycleCommand) => {
        if (!contextRequirement || contextRequirement.status !== 'draft') return;
        dispatch({ type: 'selectRequirement', requirementId: contextRequirement.id });
        onLifecycleAction?.(command, contextRequirement);
    };

    const menuItems: MenuItem[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            disabled: !contextRequirement || contextRequirement.status !== 'draft',
            command: editContextRequirement,
        },
        {
            label: 'Approve',
            icon: 'pi pi-check',
            disabled: lifecyclePending || !contextRequirement || contextRequirement.status !== 'draft',
            command: () => runContextLifecycleAction('approve'),
        },
        {
            label: 'Reject',
            icon: 'pi pi-times',
            disabled: lifecyclePending || !contextRequirement || contextRequirement.status !== 'draft',
            command: () => runContextLifecycleAction('reject'),
        },
        { separator: true },
        {
            label: 'Export requirement(s)',
            icon: 'pi pi-download',
            disabled: !contextRequirement,
            command: () => onExportRequirements(contextExportSelection()),
        },
        {
            label: 'Export all requirements',
            icon: 'pi pi-list',
            disabled: requirements.length === 0,
            command: () => onExportAllRequirements(requirements),
        },
    ];

    const handleRowClick = (event: DataTableRowClickEvent) => {
        const target = event.originalEvent.target;
        if (target instanceof Element && target.closest('.p-checkbox')) return;
        selectRequirement(event.data as RequirementView);
    };

    const handleRowDoubleClick = (event: DataTableRowClickEvent) => {
        openRequirement(event.data as RequirementView);
    };

    return (
        <>
            <ContextMenu
                model={menuItems}
                ref={contextMenu}
            />
            <DataTable
                value={[...requirements]}
                dataKey='id'
                className='requirements-list req-list'
                selection={selectedRequirements}
                selectionMode='multiple'
                rowClassName={(requirement: RequirementView) =>
                    requirement.id === selectedRequirementId ? 'requirements-list__row--selected selected' : ''
                }
                onSelectionChange={(event) => {
                    const nextSelection = event.value;
                    setSelectedRequirements(Array.isArray(nextSelection) ? nextSelection : []);
                }}
                onContextMenu={(event) => {
                    const requirement = event.data as RequirementView;
                    setContextRequirement(requirement);
                    contextMenu.current?.show(event.originalEvent);
                }}
                onRowClick={handleRowClick}
                onRowDoubleClick={handleRowDoubleClick}
                aria-label='Requirements'>
                <Column selectionMode='multiple' />
                <Column
                    field='visibleKey'
                    header='Key'
                />
                <Column
                    field='categoryKey'
                    header='Category'
                />
                <Column
                    field='type'
                    header='Type'
                />
                <Column
                    field='status'
                    header='Status'
                />
                <Column
                    field='priority'
                    header='Priority'
                />
                <Column
                    field='owner'
                    header='Owner'
                    body={(requirement: RequirementView) => requirement.owner ?? '—'}
                />
            </DataTable>
        </>
    );
}
