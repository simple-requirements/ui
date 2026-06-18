import type { ReactNode } from 'react';
import type { Action, Module, WorkspaceState } from '@/state/workspaceReducer';
import type { Category, ProjectSummary, RequirementView } from '@/types/domain';
import { NewCategoryForm } from '@/components/NewCategoryForm';
import { NewProjectForm } from '@/components/NewProjectForm';
import { RequirementForm } from '@/components/RequirementForm';
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
    activeProject: ProjectSummary | null;
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
    onCreateRequirement: Parameters<typeof RequirementForm>[0]['onSubmit'];
    createRequirementError: string | null;
    createRequirementPending: boolean;
    onEditRequirement: Parameters<typeof RequirementForm>[0]['onSubmit'];
    editRequirementError: string | null;
    editRequirementPending: boolean;
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
    activeProject,
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
    onCreateRequirement,
    createRequirementError,
    createRequirementPending,
    onEditRequirement,
    editRequirementError,
    editRequirementPending,
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

        if (mode === 'newRequirement') {
            return (
                <RequirementForm
                    mode='create'
                    project={activeProject}
                    categories={categories}
                    error={createRequirementError}
                    pending={createRequirementPending}
                    onSubmit={onCreateRequirement}
                    onCancel={(dirty) => {
                        if (!dirty || confirm('Discard unsaved requirement changes?')) handleCancelForm();
                    }}
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
                activeProject={activeProject}
                editError={editRequirementError}
                editPending={editRequirementPending}
                mode={mode}
                onEditRequirement={onEditRequirement}
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
