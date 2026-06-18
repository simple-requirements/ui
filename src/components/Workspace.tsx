import type { ReactNode } from 'react';
import type { Action, Module, WorkspaceState } from '@/state/workspaceReducer';
import type { Category, ProjectSummary, RequirementView } from '@/types/domain';
import { NewCategoryForm } from '@/components/NewCategoryForm';
import { NewProjectForm } from '@/components/NewProjectForm';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { WorkspaceModuleContent } from '@/components/WorkspaceModuleContent';

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
    createProjectError,
    createProjectPending,
    onCreateCategory,
    createCategoryError,
    createCategoryPending,
    onRetry,
}: WorkspaceProps) {
    const handleCancelForm = () => dispatch({ type: 'setMode', mode: 'workspace' });

    const renderRightPane = () => {
        if (mode === 'newProject') {
            return (
                <NewProjectForm
                    error={createProjectError}
                    pending={createProjectPending}
                    onSubmit={onCreateProject}
                    onCancel={handleCancelForm}
                />
            );
        }

        if (mode === 'newCategory') {
            return (
                <NewCategoryForm
                    error={createCategoryError}
                    pending={createCategoryPending}
                    onSubmit={onCreateCategory}
                    onCancel={handleCancelForm}
                />
            );
        }

        return (
            <WorkspaceModuleContent
                activeModule={activeModule}
                categories={categories}
                projectError={projectError}
                projectContentLoading={projectContentLoading}
                requirementDetailLoading={requirementDetailLoading}
                selectedRequirement={selectedRequirement}
                selectedRequirementId={selectedRequirementId}
                splitterPosition={splitterPosition}
                requirementsList={requirementsList}
                actionBar={actionBar}
                dispatch={dispatch}
                onRetry={onRetry}
            />
        );
    };

    return (
        <div className='workspace'>
            <ProjectSidebar
                projects={projects}
                activeProjectId={activeProjectId}
                dispatch={dispatch}
            />
            <main className='right-pane'>{renderRightPane()}</main>
        </div>
    );
}
