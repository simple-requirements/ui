import type { ReactNode } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import type { Action, Module } from '@/state/workspaceReducer';
import type { Category, RequirementView } from '@/types/domain';
import { ModuleNavigation } from '@/components/ModuleNavigation';
import { RequirementDetail } from '@/features/requirements/RequirementDetail';
import { VerticalSplitPane } from '@/layout/VerticalSplitPane';

type WorkspaceModuleContentProps = Readonly<{
    activeModule: Module;
    categories: readonly Category[];
    projectError: string | null;
    projectContentLoading: boolean;
    requirementDetailLoading: boolean;
    selectedRequirement: RequirementView | null;
    selectedRequirementId: string | null;
    splitterPosition: number;
    requirementsList: ReactNode;
    actionBar: ReactNode;
    dispatch: (action: Action) => void;
    onRetry: () => void;
}>;

/** Renders right-pane module navigation, loading/error states, categories, and requirement split panes. */
export function WorkspaceModuleContent({
    activeModule,
    categories,
    projectError,
    projectContentLoading,
    requirementDetailLoading,
    selectedRequirement,
    selectedRequirementId,
    splitterPosition,
    requirementsList,
    actionBar,
    dispatch,
    onRetry,
}: WorkspaceModuleContentProps) {
    const renderDetailPane = () => {
        if (requirementDetailLoading)
            return (
                <div
                    className='state'
                    role='status'>
                    Loading requirement detail…
                </div>
            );
        if (selectedRequirement) return <RequirementDetail requirement={selectedRequirement} />;
        if (selectedRequirementId) return <div className='state'>Unable to display selected requirement.</div>;
        return <div className='state'>No requirement selected.</div>;
    };

    return (
        <>
            <ModuleNavigation
                activeModule={activeModule}
                dispatch={dispatch}
            />
            {projectError ?
                <section className='state'>
                    <h2>Unable to load backend data</h2>
                    <p>{projectError}</p>
                    <Button
                        type='button'
                        label='Retry'
                        onClick={onRetry}
                    />
                </section>
            :   null}
            {!projectError && projectContentLoading ?
                <section
                    className='state'
                    role='status'>
                    Loading project content…
                </section>
            :   null}
            {!projectError && !projectContentLoading && activeModule === 'categories' ?
                <>
                    <div className='actionbar'>
                        <Button
                            type='button'
                            label='New category'
                            onClick={() => dispatch({ type: 'setMode', mode: 'newCategory' })}
                        />
                    </div>
                    <DataTable
                        value={[...categories]}
                        dataKey='key'
                        className='req-list'
                        aria-label='Categories'>
                        <Column
                            field='key'
                            header='Key'
                        />
                        <Column
                            field='name'
                            header='Name'
                        />
                        <Column
                            field='type'
                            header='Type'
                        />
                    </DataTable>
                </>
            :   null}
            {!projectError && !projectContentLoading && activeModule === 'requirements' ?
                <>
                    {actionBar}
                    <VerticalSplitPane
                        position={splitterPosition}
                        onChange={(position) => dispatch({ type: 'setSplitter', position })}
                        top={requirementsList}
                        bottom={renderDetailPane()}
                    />
                </>
            :   null}
        </>
    );
}
