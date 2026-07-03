import { useMutation } from '@tanstack/react-query';
import { useReducer } from 'react';

import type { SidebarProject } from '@/api/collections/projectsCollection';
import { getListProjectsQueryKey } from '@/api/generated/projects/projects';
import { createProjectRequest, updateProjectRequest } from '@/api/projectsApi';
import { queryClient } from '@/api/queryClient';
import type { ProjectDialogSubmitData } from '@/components/RootLayout/Sidebar/ProjectDialog';

type ProjectDialogState = Readonly<{ mode: 'create' }> | Readonly<{ mode: 'rename'; project: SidebarProject }>;

type ProjectDialogAction =
    | Readonly<{ type: 'open-create' }>
    | Readonly<{ type: 'open-rename'; project: SidebarProject }>
    | Readonly<{ type: 'close' }>;

type UpdateProjectMutationVariables = Readonly<{ projectId: string; formData: ProjectDialogSubmitData }>;

export type ProjectDialogController = Readonly<{
    visible: boolean;
    mode: 'create' | 'rename';
    initialName: string;
    pending: boolean;
    errorMessage: string | undefined;
    openCreateProjectDialog: () => void;
    openRenameProjectDialog: (project: SidebarProject) => void;
    cancelProjectDialog: () => void;
    submitProjectDialog: (formData: ProjectDialogSubmitData) => Promise<void>;
}>;

function projectDialogReducer(
    _state: ProjectDialogState | undefined,
    action: ProjectDialogAction,
): ProjectDialogState | undefined {
    switch (action.type) {
        case 'open-create':
            return { mode: 'create' };
        case 'open-rename':
            return { mode: 'rename', project: action.project };
        case 'close':
            return undefined;
    }
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return 'The project could not be saved.';
}

export function useProjectDialogController(): ProjectDialogController {
    const [projectDialogState, dispatchProjectDialog] = useReducer(projectDialogReducer, undefined);

    const createProjectMutation = useMutation({
        mutationFn: async (formData: ProjectDialogSubmitData): Promise<void> => {
            await createProjectRequest({ name: formData.name });
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
            dispatchProjectDialog({ type: 'close' });
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: async ({ projectId, formData }: UpdateProjectMutationVariables): Promise<void> => {
            await updateProjectRequest(projectId, { name: formData.name });
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
            dispatchProjectDialog({ type: 'close' });
        },
    });

    const visible = projectDialogState !== undefined;
    const mode = projectDialogState?.mode ?? 'create';
    const initialName = projectDialogState?.mode === 'rename' ? projectDialogState.project.name : '';
    const pending =
        projectDialogState?.mode === 'rename' ? updateProjectMutation.isPending : createProjectMutation.isPending;
    const error = projectDialogState?.mode === 'rename' ? updateProjectMutation.error : createProjectMutation.error;
    const errorMessage = error === null ? undefined : getErrorMessage(error);

    function resetProjectDialogMutations(): void {
        createProjectMutation.reset();
        updateProjectMutation.reset();
    }

    function openCreateProjectDialog(): void {
        resetProjectDialogMutations();
        dispatchProjectDialog({ type: 'open-create' });
    }

    function openRenameProjectDialog(project: SidebarProject): void {
        resetProjectDialogMutations();
        dispatchProjectDialog({ type: 'open-rename', project });
    }

    function cancelProjectDialog(): void {
        if (createProjectMutation.isPending || updateProjectMutation.isPending) {
            return;
        }

        resetProjectDialogMutations();
        dispatchProjectDialog({ type: 'close' });
    }

    async function submitProjectDialog(formData: ProjectDialogSubmitData): Promise<void> {
        if (projectDialogState?.mode === 'rename') {
            await updateProjectMutation.mutateAsync({ projectId: projectDialogState.project.id, formData });

            return;
        }

        await createProjectMutation.mutateAsync(formData);
    }

    return {
        visible,
        mode,
        initialName,
        pending,
        errorMessage,
        openCreateProjectDialog,
        openRenameProjectDialog,
        cancelProjectDialog,
        submitProjectDialog,
    };
}
