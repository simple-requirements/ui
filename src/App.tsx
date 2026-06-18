import 'primeicons/primeicons.css';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useReducer, useState } from 'react';
import { ActionBar } from '@/components/ActionBar';
import { AppTabBar } from '@/components/AppTabBar';
import { RequirementsList } from '@/components/RequirementsList';
import { Workspace } from '@/components/Workspace';
import { mapApiError } from '@/api/errors/apiError';
import { categoryKeys, projectKeys, requirementKeys } from '@/api/queryKeys';
import { createCategory, listCategories } from '@/features/categories/api/categoriesApi';
import { listProjects } from '@/features/projects/api/projectsApi';
import {
    getRequirement,
    listRequirementsByProject,
    lookupRequirementByVisibleKey,
} from '@/features/requirements/api/requirementsApi';
import { RequirementDetail } from '@/features/requirements/RequirementDetail';
import { LoadingOverlay } from '@/layout/LoadingOverlay';
import { loadWorkspaceState, saveWorkspaceState } from '@/state/sessionPersistence';
import { workspaceReducer } from '@/state/workspaceReducer';

function formValue(formData: FormData, fieldName: string) {
    const value = formData.get(fieldName);
    return typeof value === 'string' ? value : '';
}

/** Coordinates backend server state, workspace state, and top-level application layout. */
export default function App() {
    const queryClient = useQueryClient();
    const [workspaceState, dispatch] = useReducer(workspaceReducer, undefined, loadWorkspaceState);
    const [lookupMessage, setLookupMessage] = useState<string | null>(null);

    useEffect(() => saveWorkspaceState(workspaceState), [workspaceState]);

    const projectsQuery = useQuery({
        queryKey: projectKeys.all,
        queryFn: ({ signal }) => listProjects({ signal }),
        retry: false,
    });
    const categoriesQuery = useQuery({
        queryKey: categoryKeys.all,
        queryFn: ({ signal }) => listCategories({ signal }),
        retry: false,
    });
    const requirementsQuery = useQuery({
        queryKey:
            workspaceState.activeProjectId ?
                requirementKeys.list(workspaceState.activeProjectId)
            :   requirementKeys.list('none'),
        queryFn: ({ signal }) => listRequirementsByProject(workspaceState.activeProjectId ?? '', { signal }),
        enabled: Boolean(workspaceState.activeProjectId),
        retry: false,
    });
    const detailQuery = useQuery({
        queryKey:
            workspaceState.selectedRequirementId ?
                requirementKeys.detail(workspaceState.selectedRequirementId)
            :   requirementKeys.detail('none'),
        queryFn: ({ signal }) => getRequirement(workspaceState.selectedRequirementId ?? '', { signal }),
        enabled: Boolean(workspaceState.selectedRequirementId),
        retry: false,
    });

    const activeRequirementTab = workspaceState.openRequirementTabs.find(
        (tab) => tab.id === workspaceState.activeAppTabId,
    );
    const tabDetailQuery = useQuery({
        queryKey:
            activeRequirementTab ?
                requirementKeys.detail(activeRequirementTab.requirementId)
            :   requirementKeys.detail('none'),
        queryFn: ({ signal }) => getRequirement(activeRequirementTab?.requirementId ?? '', { signal }),
        enabled: Boolean(activeRequirementTab),
        retry: false,
    });

    useEffect(() => {
        if (!projectsQuery.data || workspaceState.activeProjectId) return;
        if (projectsQuery.data[0]) dispatch({ type: 'selectProject', projectId: projectsQuery.data[0].id });
    }, [projectsQuery.data, workspaceState.activeProjectId]);

    useEffect(() => {
        if (workspaceState.activeProjectId) {
            history.replaceState(
                null,
                '',
                `/workspace/projects/${workspaceState.activeProjectId}/${workspaceState.activeModule}`,
            );
        }
    }, [workspaceState.activeProjectId, workspaceState.activeModule]);

    useEffect(() => {
        if (!requirementsQuery.data || !workspaceState.selectedRequirementId) return;
        if (!requirementsQuery.data.some((requirement) => requirement.id === workspaceState.selectedRequirementId)) {
            dispatch({ type: 'selectRequirement', requirementId: null });
        }
    }, [requirementsQuery.data, workspaceState.selectedRequirementId]);

    const createProjectMutation = useMutation({
        mutationFn: () =>
            Promise.reject(new Error('Backend contract gap: openapi/backend-api.json does not expose POST /projects.')),
        onSuccess: async () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
    });

    const createCategoryMutation = useMutation({
        mutationFn: (formData: FormData) =>
            createCategory({
                name: formValue(formData, 'name'),
                key: formValue(formData, 'key'),
                type: formValue(formData, 'type') === 'NFR' ? 'NFR' : 'FR',
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            dispatch({ type: 'setMode', mode: 'workspace' });
        },
    });

    const lookupMutation = useMutation({
        mutationFn: (visibleKey: string) => lookupRequirementByVisibleKey(visibleKey.trim()),
        onMutate: () => setLookupMessage(null),
        onSuccess: (requirement) => {
            if (requirement.projectId && requirement.projectId !== workspaceState.activeProjectId) {
                setLookupMessage(
                    `Requirement ${requirement.visibleKey} belongs to project ${requirement.projectId}. Switch projects explicitly before opening it.`,
                );
                return;
            }
            dispatch({ type: 'selectRequirement', requirementId: requirement.id });
            setLookupMessage(`Selected ${requirement.visibleKey}.`);
        },
        onError: (error) => setLookupMessage(mapApiError(error).message),
    });

    const projects = projectsQuery.data ?? [];
    const activeProjectKnown =
        !workspaceState.activeProjectId || projects.some((project) => project.id === workspaceState.activeProjectId);

    const workspace = (
        <Workspace
            projects={projects}
            activeProjectId={workspaceState.activeProjectId}
            mode={workspaceState.mode}
            activeModule={workspaceState.activeModule}
            selectedRequirementId={workspaceState.selectedRequirementId}
            splitterPosition={workspaceState.splitterPosition}
            categories={categoriesQuery.data ?? []}
            projectError={
                projectsQuery.isError ? mapApiError(projectsQuery.error).message
                : !activeProjectKnown ?
                    'The project in the URL is not available.'
                :   null
            }
            projectContentLoading={requirementsQuery.isFetching || categoriesQuery.isFetching}
            requirementDetailLoading={detailQuery.isFetching}
            selectedRequirement={detailQuery.data ?? null}
            requirementsList={
                <RequirementsList
                    requirements={requirementsQuery.data ?? []}
                    selectedRequirementId={workspaceState.selectedRequirementId}
                    dispatch={dispatch}
                />
            }
            actionBar={
                <ActionBar
                    activeProjectId={workspaceState.activeProjectId}
                    selectedRequirement={detailQuery.data ?? null}
                    lookupMessage={lookupMessage}
                    lookupPending={lookupMutation.isPending}
                    onLookup={(visibleKey) => lookupMutation.mutate(visibleKey)}
                    dispatch={dispatch}
                />
            }
            dispatch={dispatch}
            onCreateProject={() => createProjectMutation.mutate()}
            createProjectError={createProjectMutation.error ? mapApiError(createProjectMutation.error).message : null}
            createProjectPending={createProjectMutation.isPending}
            onCreateCategory={(formData) => createCategoryMutation.mutate(formData)}
            createCategoryError={
                createCategoryMutation.error ? mapApiError(createCategoryMutation.error).message : null
            }
            createCategoryPending={createCategoryMutation.isPending}
            onRetry={() => void projectsQuery.refetch()}
        />
    );

    const renderActivePanel = () => {
        if (!activeRequirementTab) return workspace;
        return (
            <main className='workspace-dedicated dedicated'>
                <ActionBar
                    activeProjectId={workspaceState.activeProjectId}
                    selectedRequirement={tabDetailQuery.data ?? null}
                    dedicated
                    dispatch={dispatch}
                />
                {tabDetailQuery.isError ?
                    <div className='workspace-state state'>{mapApiError(tabDetailQuery.error).message}</div>
                :   null}
                {tabDetailQuery.isFetching ?
                    <div className='workspace-state state'>Loading requirement detail…</div>
                :   null}
                {tabDetailQuery.data ?
                    <RequirementDetail requirement={tabDetailQuery.data} />
                :   null}
            </main>
        );
    };

    return (
        <div className='app-shell'>
            <AppTabBar
                activeAppTabId={workspaceState.activeAppTabId}
                openRequirementTabs={workspaceState.openRequirementTabs}
                dispatch={dispatch}
            />
            <section
                className='app-shell__panel panel'
                role='tabpanel'>
                {renderActivePanel()}
            </section>
            {projectsQuery.isLoading ?
                <LoadingOverlay />
            :   null}
        </div>
    );
}
