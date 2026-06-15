import type { SyntheticEvent, ReactNode } from 'react';
import type { Category, DemoRequirement, ProjectSummary } from '@/demo/demoTypes';
import { RequirementDetail } from '@/features/requirements/RequirementDetail';
import { VerticalSplitPane } from '@/layout/VerticalSplitPane';
import type { Action, Module, WorkspaceState } from '@/state/workspaceReducer';
import { ModuleNavigation } from '@/components/ModuleNavigation';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { RequirementForm } from '@/components/RequirementForm';

interface WorkspaceProps {
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
}

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
        <div className="workspace">
            <ProjectSidebar projects={projects} activeProjectId={activeProjectId} dispatch={dispatch} />
            <main className="right-pane">
                {mode === 'newProject' ? (
                    <form className="form" onSubmit={handleCreateProjectSubmit}>
                        <h2>New Project</h2>
                        <label>
                            Project name
                            <input name="name" required />
                        </label>
                        <button>Create</button>
                        <button type="button" onClick={() => dispatch({ type: 'setMode', mode: 'workspace' })}>
                            Cancel
                        </button>
                    </form>
                ) : mode === 'newRequirement' ? (
                    <RequirementForm
                        categories={categories}
                        onSubmit={onCreateRequirement}
                        onCancel={() => dispatch({ type: 'setMode', mode: 'workspace' })}
                    />
                ) : (
                    <>
                        <ModuleNavigation activeModule={activeModule} dispatch={dispatch} />
                        {projectError ? (
                            <section className="state">
                                <h2>Unable to load demo data</h2>
                                <p>{projectError}</p>
                                <button onClick={onRetry}>Retry</button>
                            </section>
                        ) : null}
                        {!projectError && projectContentLoading ? (
                            <section className="state" role="status">
                                Loading project content…
                            </section>
                        ) : null}
                        {!projectError && !projectContentLoading && activeModule === 'categories' ? (
                            <>
                                <div className="actionbar">
                                    <button onClick={() => dispatch({ type: 'setMode', mode: 'newCategory' })}>
                                        New category
                                    </button>
                                </div>
                                <table className="req-list">
                                    <tbody>
                                        {categories.map((category) => (
                                            <tr key={category.key}>
                                                <td>{category.key}</td>
                                                <td>{category.name}</td>
                                                <td>{category.type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        ) : null}
                        {!projectError && !projectContentLoading && activeModule === 'requirements' ? (
                            <>
                                {actionBar}
                                <VerticalSplitPane
                                    position={splitterPosition}
                                    onChange={(position) => dispatch({ type: 'setSplitter', position })}
                                    top={requirementsList}
                                    bottom={
                                        requirementDetailLoading ? (
                                            <div className="state" role="status">
                                                Loading requirement detail…
                                            </div>
                                        ) : selectedRequirement ? (
                                            <RequirementDetail requirement={selectedRequirement} />
                                        ) : selectedRequirementId ? (
                                            <div className="state">Unable to display selected requirement.</div>
                                        ) : (
                                            <div className="state">No requirement selected.</div>
                                        )
                                    }
                                />
                            </>
                        ) : null}
                    </>
                )}
            </main>
        </div>
    );
}
