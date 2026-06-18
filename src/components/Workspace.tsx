import type { SyntheticEvent, ReactNode } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import type { Category, ProjectSummary, RequirementView } from '@/types/domain';
import { RequirementDetail } from '@/features/requirements/RequirementDetail';
import { VerticalSplitPane } from '@/layout/VerticalSplitPane';
import type { Action, Module, WorkspaceState } from '@/state/workspaceReducer';
import { ModuleNavigation } from '@/components/ModuleNavigation';
import { ProjectSidebar } from '@/components/ProjectSidebar';

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
    selectedRequirement: RequirementView | null;
    requirementsList: ReactNode;
    actionBar: ReactNode;
    dispatch: (action: Action) => void;
    onCreateProject: (formData: FormData) => void;
    createProjectError: string | null;
    createProjectPending: boolean;
    onCreateCategory: (formData: FormData) => void;
    createCategoryError: string | null;
    createCategoryPending: boolean;
    onRetry: () => void;
}>;

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
    createProjectError,
    createProjectPending,
    onCreateCategory,
    createCategoryError,
    createCategoryPending,
    onRetry,
}: WorkspaceProps) {
    function handleSubmit(callback: (formData: FormData) => void) {
        return (event: SyntheticEvent<HTMLFormElement>) => {
            event.preventDefault();
            callback(new FormData(event.currentTarget));
        };
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
                        onSubmit={handleSubmit(onCreateProject)}
                        aria-describedby={createProjectError ? 'project-form-error' : undefined}>
                        <h2>New Project</h2>
                        <label>
                            Project name
                            <InputText
                                name='name'
                                required
                            />
                        </label>
                        {createProjectError ?
                            <p
                                id='project-form-error'
                                className='form__error'>
                                {createProjectError}
                            </p>
                        :   null}
                        <Button
                            type='submit'
                            label='Create'
                            disabled={createProjectPending}
                        />
                        <Button
                            type='button'
                            label='Cancel'
                            onClick={() => dispatch({ type: 'setMode', mode: 'workspace' })}
                        />
                    </form>
                : mode === 'newCategory' ?
                    <form
                        className='form'
                        onSubmit={handleSubmit(onCreateCategory)}
                        aria-describedby={createCategoryError ? 'category-form-error' : undefined}>
                        <h2>New Category</h2>
                        <label>
                            Category key
                            <InputText
                                name='key'
                                required
                                pattern='[A-Z][A-Z0-9_]*'
                            />
                        </label>
                        <label>
                            Category name
                            <InputText
                                name='name'
                                required
                            />
                        </label>
                        <label>
                            <input
                                type='radio'
                                name='type'
                                value='FR'
                                defaultChecked
                            />{' '}
                            Functional (FR)
                        </label>
                        <label>
                            <input
                                type='radio'
                                name='type'
                                value='NFR'
                            />{' '}
                            Non-functional (NFR)
                        </label>
                        {createCategoryError ?
                            <p
                                id='category-form-error'
                                className='form__error'>
                                {createCategoryError}
                            </p>
                        :   null}
                        <Button
                            type='submit'
                            label='Create'
                            disabled={createCategoryPending}
                        />
                        <Button
                            type='button'
                            label='Cancel'
                            onClick={() => dispatch({ type: 'setMode', mode: 'workspace' })}
                        />
                    </form>
                :   <>
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
                                <>{actionBar}</>
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
