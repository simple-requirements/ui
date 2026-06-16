import type { SyntheticEvent, ReactNode } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import type { Category, DemoRequirement, ProjectSummary } from '@/demo/demoTypes';
import { RequirementDetail } from '@/features/requirements/RequirementDetail';
import { VerticalSplitPane } from '@/layout/VerticalSplitPane';
import type { Action, Module, WorkspaceState } from '@/state/workspaceReducer';
import { ModuleNavigation } from '@/components/ModuleNavigation';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { RequirementForm } from '@/components/RequirementForm';

type WorkspaceProps = Readonly<{
    projects: readonly ProjectSummary[];
    activeProjectId: string | null;
    mode: WorkspaceState['mode'];
    activeModule: Module;
    selectedRequirementId: string | null;
    splitterPosition: number;
    categories: readonly Category[];
    projectError: string | null;
    projectContentLoading: boolean;
    requirementDetailLoading: boolean;
    selectedRequirement: DemoRequirement | null;
    requirementsList: ReactNode;
    actionBar: ReactNode;
    dispatch: (action: Action) => void;
    onCreateProject: (formData: FormData) => void;
    onCreateRequirement: (formData: FormData) => void;
    onRetry: () => void;
}>;

/** Composes the project sidebar with the active right-pane workspace content. */
export function Workspace({
    projects,
    activeProjectId,
    mode,
    activeModule,
    selectedRequirementId,
    splitterPosition,
    categories,
    projectError,
    projectContentLoading,
    requirementDetailLoading,
    selectedRequirement,
    requirementsList,
    actionBar,
    dispatch,
    onCreateProject,
    onCreateRequirement,
    onRetry,
}: WorkspaceProps) {
    function handleCreateProjectSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        onCreateProject(new FormData(event.currentTarget));
    }

    return (
        <div className='workspace'>
            <ProjectSidebar
                projects={projects}
                activeProjectId={activeProjectId}
                dispatch={dispatch}
            />
            <main className='right-pane'>
                {mode === 'newProject' ?
                    <form
                        className='form'
                        onSubmit={handleCreateProjectSubmit}>
                        <h2>New Project</h2>
                        <label>
                            Project name
                            <InputText
                                name='name'
                                required
                            />
                        </label>
                        <Button
                            type='submit'
                            label='Create'
                        />
                        <Button
                            type='button'
                            label='Cancel'
                            onClick={() => dispatch({ type: 'setMode', mode: 'workspace' })}
                        />
                    </form>
                : mode === 'newRequirement' ?
                    <RequirementForm
                        categories={categories}
                        onSubmit={onCreateRequirement}
                        onCancel={() => dispatch({ type: 'setMode', mode: 'workspace' })}
                    />
                :   <>
                        <ModuleNavigation
                            activeModule={activeModule}
                            dispatch={dispatch}
                        />
                        {projectError ?
                            <section className='state'>
                                <h2>Unable to load demo data</h2>
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
                                    bottom={
                                        requirementDetailLoading ?
                                            <div
                                                className='state'
                                                role='status'>
                                                Loading requirement detail…
                                            </div>
                                        : selectedRequirement ?
                                            <RequirementDetail requirement={selectedRequirement} />
                                        : selectedRequirementId ?
                                            <div className='state'>Unable to display selected requirement.</div>
                                        :   <div className='state'>No requirement selected.</div>
                                    }
                                />
                            </>
                        :   null}
                    </>
                }
            </main>
        </div>
    );
}
