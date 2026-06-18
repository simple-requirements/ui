import 'primeicons/primeicons.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useReducer, useState } from 'react';
import { ActionBar } from '@/components/ActionBar';
import { AppTabBar } from '@/components/AppTabBar';
import { RequirementsList } from '@/components/RequirementsList';
import { Workspace } from '@/components/Workspace';
import { mapApiError } from '@/api/errors/apiError';
import {
    assertImmutableRequirementFields,
    createRequirement,
    isRequirementEditable,
    synchronizeRequirementFromServer,
    updateRequirement,
} from '@/features/requirements/requirementForms';
import { RequirementDetail } from '@/features/requirements/RequirementDetail';
import { RequirementForm } from '@/components/RequirementForm';
import { LoadingOverlay } from '@/layout/LoadingOverlay';
import { useCategoriesQuery, useCreateCategoryMutation } from '@/utils/categoryQueries';
import { useCreateProjectMutation, useProjectsQuery } from '@/utils/projectQueries';
import {
    useProjectRequirementsQuery,
    useRequirementDetailQuery,
    useRequirementLookupMutation,
} from '@/utils/requirementQueries';
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

    const projectsQuery = useProjectsQuery();
    const categoriesQuery = useCategoriesQuery();
    const requirementsQuery = useProjectRequirementsQuery(workspaceState.activeProjectId);
    const detailQuery = useRequirementDetailQuery(workspaceState.selectedRequirementId);

    const activeRequirementTab = workspaceState.openRequirementTabs.find(
        (tab) => tab.id === workspaceState.activeAppTabId,
    );
    const tabDetailQuery = useRequirementDetailQuery(activeRequirementTab?.requirementId);

    useEffect(() => {
        if (workspaceState.activeProjectId) return;
        if (projectsQuery.data.length === 0) return;
        dispatch({ type: 'selectProject', projectId: projectsQuery.data[0].id });
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
        if (!workspaceState.selectedRequirementId) return;
        if (!requirementsQuery.data.some((requirement) => requirement.id === workspaceState.selectedRequirementId)) {
            dispatch({ type: 'selectRequirement', requirementId: null });
        }
    }, [requirementsQuery.data, workspaceState.selectedRequirementId]);

    const projects = projectsQuery.data;
    const activeProjectKnown =
        !workspaceState.activeProjectId || projects.some((project) => project.id === workspaceState.activeProjectId);

    const createProjectMutation = useCreateProjectMutation(queryClient);
    const createCategoryMutation = useCreateCategoryMutation(queryClient, () =>
        dispatch({ type: 'setMode', mode: 'workspace' }),
    );
    const lookupMutation = useRequirementLookupMutation();
    const activeProject = projects.find((project) => project.id === workspaceState.activeProjectId) ?? null;
    const createRequirementMutation = useMutation({
        mutationFn: createRequirement,
        onSuccess: async (requirement) => {
            await synchronizeRequirementFromServer({
                requirement,
                projectId: workspaceState.activeProjectId,
                reason: 'created',
                queryClient,
            });
            dispatch({ type: 'setMode', mode: 'workspace' });
            dispatch({ type: 'selectRequirement', requirementId: requirement.id });
        },
    });
    const editRequirementMutation = useMutation({
        mutationFn: async (values: Parameters<typeof updateRequirement>[1]) => {
            const current = workspaceState.activeAppTabId === 'workspace' ? detailQuery.data : tabDetailQuery.data;
            if (!current) throw new Error('Requirement detail must load before editing.');
            if (!isRequirementEditable(current.status)) throw new Error('Only draft requirements can be edited.');
            const updated = await updateRequirement(current.id, values);
            assertImmutableRequirementFields(current, updated);
            return updated;
        },
        onSuccess: async (requirement) => {
            await synchronizeRequirementFromServer({
                requirement,
                projectId: workspaceState.activeProjectId,
                reason: 'updated',
                queryClient,
            });
            dispatch({ type: 'setMode', mode: 'workspace' });
        },
    });

    useEffect(() => {
        if (!lookupMutation.isSuccess) return;
        const requirement = lookupMutation.data;
        if (requirement.projectId && requirement.projectId !== workspaceState.activeProjectId) {
            setLookupMessage(
                `Requirement ${requirement.visibleKey} belongs to project ${requirement.projectId}. Switch projects explicitly before opening it.`,
            );
            return;
        }
        dispatch({ type: 'selectRequirement', requirementId: requirement.id });
        setLookupMessage(`Selected ${requirement.visibleKey}.`);
    }, [lookupMutation.isSuccess, lookupMutation.data, workspaceState.activeProjectId]);

    useEffect(() => {
        if (lookupMutation.isError) setLookupMessage(mapApiError(lookupMutation.error).message);
    }, [lookupMutation.isError, lookupMutation.error]);

    const workspace = (
        <Workspace
            projects={projects}
            activeProjectId={workspaceState.activeProjectId}
            mode={workspaceState.mode}
            activeModule={workspaceState.activeModule}
            selectedRequirementId={workspaceState.selectedRequirementId}
            splitterPosition={workspaceState.splitterPosition}
            categories={categoriesQuery.data}
            activeProject={activeProject}
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
                    requirements={requirementsQuery.data}
                    selectedRequirementId={workspaceState.selectedRequirementId}
                    dispatch={dispatch}
                />
            }
            actionBar={
                <ActionBar
                    activeProjectId={workspaceState.activeProjectId}
                    selectedRequirement={detailQuery.data ?? null}
                    canCreateRequirement={Boolean(
                        workspaceState.activeProjectId
                        && activeProjectKnown
                        && !categoriesQuery.isError
                        && categoriesQuery.data.length > 0,
                    )}
                    createUnavailableReason={
                        !workspaceState.activeProjectId ? 'Select a project before creating a requirement.'
                        : categoriesQuery.isError ?
                            'Categories could not be loaded.'
                        : categoriesQuery.data.length === 0 ?
                            'Create a category before creating a requirement.'
                        :   'Project is not available.'
                    }
                    lookupMessage={lookupMessage}
                    lookupPending={lookupMutation.isPending}
                    onLookup={(visibleKey) => {
                        setLookupMessage(null);
                        lookupMutation.mutate(visibleKey);
                    }}
                    dispatch={dispatch}
                />
            }
            dispatch={dispatch}
            onCreateProject={() => createProjectMutation.mutate()}
            createProjectError={createProjectMutation.error ? mapApiError(createProjectMutation.error).message : null}
            createProjectPending={createProjectMutation.isPending}
            onCreateCategory={(formData) =>
                createCategoryMutation.mutate({
                    name: formValue(formData, 'name'),
                    key: formValue(formData, 'key'),
                    type: formValue(formData, 'type') === 'NFR' ? 'NFR' : 'FR',
                })
            }
            createCategoryError={
                createCategoryMutation.error ? mapApiError(createCategoryMutation.error).message : null
            }
            createCategoryPending={createCategoryMutation.isPending}
            onCreateRequirement={(values) => createRequirementMutation.mutate(values)}
            createRequirementError={
                createRequirementMutation.error ? mapApiError(createRequirementMutation.error).message : null
            }
            createRequirementPending={createRequirementMutation.isPending}
            onEditRequirement={(values) => editRequirementMutation.mutate(values)}
            editRequirementError={
                editRequirementMutation.error ? mapApiError(editRequirementMutation.error).message : null
            }
            editRequirementPending={editRequirementMutation.isPending}
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
                {tabDetailQuery.data && workspaceState.mode === 'editRequirementTab' ?
                    <RequirementForm
                        mode='edit'
                        project={activeProject}
                        categories={categoriesQuery.data}
                        initialRequirement={tabDetailQuery.data}
                        error={
                            editRequirementMutation.error ? mapApiError(editRequirementMutation.error).message : null
                        }
                        pending={editRequirementMutation.isPending}
                        onSubmit={(values) => editRequirementMutation.mutate(values)}
                        onCancel={(dirty) => {
                            if (!dirty || confirm('Discard unsaved requirement changes?'))
                                dispatch({ type: 'setMode', mode: 'workspace' });
                        }}
                    />
                : tabDetailQuery.data ?
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
