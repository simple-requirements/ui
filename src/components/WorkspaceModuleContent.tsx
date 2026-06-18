import type { ReactNode } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import type { Action, Module } from '@/state/workspaceReducer';
import type { Category, ProjectSummary, RequirementView } from '@/types/domain';
import { ModuleNavigation } from '@/components/ModuleNavigation';
import { RequirementDetail } from '@/features/requirements/RequirementDetail';
import { RequirementHistory } from '@/features/requirements/RequirementHistory';
import { RequirementForm } from '@/components/RequirementForm';
import { VerticalSplitPane } from '@/layout/VerticalSplitPane';

type WorkspaceModuleContentProps = Readonly<{
    activeModule: Module;
    categories: readonly Category[];
    projectError: string | null;
    projectContentLoading: boolean;
    requirementDetailLoading: boolean;
    requirementDetailError: string | null;
    selectedRequirement: RequirementView | null;
    selectedRequirementId: string | null;
    splitterPosition: number;
    requirementsList: ReactNode;
    actionBar: ReactNode;
    dispatch: (action: Action) => void;
    onRetry: () => void;
    activeProject?: ProjectSummary | null;
    editError?: string | null;
    editPending?: boolean;
    mode?: string;
    onEditRequirement?: Parameters<typeof RequirementForm>[0]['onSubmit'];
}>;

/** Renders right-pane module navigation, loading/error states, categories, and requirement split panes. */
export function WorkspaceModuleContent({
    activeModule,
    categories,
    projectError,
    projectContentLoading,
    requirementDetailLoading,
    requirementDetailError,
    selectedRequirement,
    selectedRequirementId,
    splitterPosition,
    requirementsList,
    actionBar,
    dispatch,
    onRetry,
    activeProject = null,
    editError = null,
    editPending = false,
    mode = 'workspace',
    onEditRequirement,
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
        if (requirementDetailError) return <div className='state'>{requirementDetailError}</div>;
        if (selectedRequirement && mode === 'history')
            return (
                <RequirementHistory
                    requirement={selectedRequirement}
                    onClose={() => dispatch({ type: 'setMode', mode: 'workspace' })}
                />
            );
        if (selectedRequirement && mode === 'editRequirement')
            return (
                <RequirementForm
                    mode='edit'
                    project={activeProject}
                    categories={categories}
                    initialRequirement={selectedRequirement}
                    error={editError}
                    pending={editPending}
                    onSubmit={(values) => onEditRequirement?.(values)}
                    onCancel={(dirty) => {
                        if (!dirty || confirm('Discard unsaved requirement changes?'))
                            dispatch({ type: 'setMode', mode: 'workspace' });
                    }}
                />
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
