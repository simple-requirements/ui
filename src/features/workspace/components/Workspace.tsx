import { useEffect, useState, type ReactNode } from 'react';
import { useConfirmDialog } from '@/shared/dialogs/ConfirmDialogProvider';
import type { Action, Module, WorkspaceState } from '@/state/workspaceReducer';
import type { Category, ProjectSummary, RequirementView } from '@/types/domain';
import { NewCategoryForm } from '@/features/categories/components/NewCategoryForm';
import { NewProjectForm } from '@/features/projects/components/NewProjectForm';
import { RequirementForm } from '@/features/requirements/components/RequirementForm';
import { ProjectSidebar } from '@/features/projects/components/ProjectSidebar';
import { WorkspaceModuleContent } from '@/features/workspace/components/WorkspaceModuleContent';

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
    requirementDetailError: string | null;
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
    onExportProject: (project: ProjectSummary) => void;
    onExportAllProjects: () => void;
    initialComparison?: string | null;
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
    requirementDetailError,
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
    onExportProject,
    onExportAllProjects,
    initialComparison = null,
}: WorkspaceProps) {
    const { confirm } = useConfirmDialog();
    const [newProjectDirty, setNewProjectDirty] = useState(false);
    const handleCancelForm = () => dispatch({ type: 'setMode', mode: 'workspace' });
    useEffect(() => {
        if (mode !== 'newProject') setNewProjectDirty(false);
    }, [mode]);

    const confirmDiscardChanges = (onConfirmed: () => void) => {
        void confirm({
            title: 'Discard unsaved changes',
            message: 'Discard unsaved changes?',
            acceptLabel: 'Discard',
            acceptSeverity: 'danger',
        }).then((confirmed) => {
            if (confirmed) onConfirmed();
        });
    };

    const hasDirtyForm = mode === 'newProject' && newProjectDirty;

    const dispatchWithDirtyFormGuard = (action: Action) => {
        if (!hasDirtyForm) {
            dispatch(action);
            return;
        }
        confirmDiscardChanges(() => {
            setNewProjectDirty(false);
            dispatch(action);
        });
    };

    const renderRightPane = () => {
        if (mode === 'newProject') {
            return (
                <NewProjectForm
                    error={createProjectError}
                    pending={createProjectPending}
                    onSubmit={onCreateProject}
                    onDirtyChange={setNewProjectDirty}
                    onCancel={(dirty) => {
                        if (!dirty) {
                            handleCancelForm();
                            return;
                        }
                        confirmDiscardChanges(handleCancelForm);
                    }}
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
                        if (!dirty) {
                            handleCancelForm();
                            return;
                        }
                        confirmDiscardChanges(handleCancelForm);
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
                requirementDetailError={requirementDetailError}
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
                initialComparison={initialComparison}
            />
        );
    };

    return (
        <div className='workspace'>
            <ProjectSidebar
                projects={projects}
                activeProjectId={activeProjectId}
                dispatch={dispatchWithDirtyFormGuard}
                onExportProject={onExportProject}
                onExportAllProjects={onExportAllProjects}
            />
            <main className='right-pane'>{renderRightPane()}</main>
        </div>
    );
}
