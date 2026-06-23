import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useReducer, useState } from 'react';
import { ActionBar } from '@/features/workspace/components/ActionBar';
import { AppTabBar } from '@/features/workspace/components/AppTabBar';
import { RequirementsList } from '@/features/requirements/components/RequirementsList';
import { Workspace } from '@/features/workspace/components/Workspace';
import { mapApiError } from '@/api/errors/apiError';
import { createRequirement, synchronizeRequirementFromServer } from '@/features/requirements/requirementForms';
import { RequirementDetail } from '@/features/requirements/components/RequirementDetail';
import { RequirementHistory } from '@/features/requirements/components/RequirementHistory';
import { RequirementForm } from '@/features/requirements/components/RequirementForm';
import { LoadingOverlay } from '@/layout/LoadingOverlay';
import { useCategoriesQuery, useCreateCategoryMutation } from '@/features/categories/api/categoryQueries';
import {
    ProjectCreationUnavailableError,
    useCreateProjectMutation,
    useProjectsQuery,
} from '@/features/projects/api/projectQueries';
import {
    useProjectRequirementsQuery,
    useRequirementDetailQuery,
    useRequirementLookupMutation,
} from '@/features/requirements/api/requirementQueries';
import { loadWorkspaceState, saveWorkspaceState } from '@/state/sessionPersistence';
import { workspaceReducer } from '@/state/workspaceReducer';
import { formValue } from '@/shared/forms/formData';
import { useEditRequirementMutation } from '@/features/requirements/api/editRequirementMutation';
import {
    useRequirementLifecycleMutation,
    type RequirementLifecycleCommand,
} from '@/features/requirements/api/requirementLifecycleMutation';
import { deriveProjectAvailability } from '@/features/projects/projectAvailability';
import { validateVisibleKey } from '@/features/requirements/api/requirementsApi';
import { parseRequirementComparisonPath } from '@/features/requirements/comparisonRefs';

/** Coordinates backend server state, workspace state, and top-level application layout. */
export default function App() {
    const queryClient = useQueryClient();
    const [workspaceState, dispatch] = useReducer(workspaceReducer, undefined, loadWorkspaceState);
    const [lookupMessage, setLookupMessage] = useState<string | null>(null);
    const directComparison = parseRequirementComparisonPath(location.pathname);

    useEffect(() => saveWorkspaceState(workspaceState), [workspaceState]);

    useEffect(() => {
        if (!directComparison) return;
        dispatch({ type: 'selectRequirement', requirementId: directComparison.requirementId });
        dispatch({ type: 'setMode', mode: 'history' });
    }, [directComparison?.requirementId]);

    const projectsQuery = useProjectsQuery();
    const categoriesQuery = useCategoriesQuery();
    const requirementsQuery = useProjectRequirementsQuery(workspaceState.activeProjectId);
    const detailQuery = useRequirementDetailQuery(workspaceState.selectedRequirementId);

    const activeRequirementTab = workspaceState.openRequirementTabs.find(
        (tab) => tab.id === workspaceState.activeAppTabId,
    );
    const tabDetailQuery = useRequirementDetailQuery(activeRequirementTab?.requirementId);

    useEffect(() => {
        if (projectsQuery.isLoading || projectsQuery.isFetching) return;
        if (projectsQuery.data.length === 0) return;
        if (
            workspaceState.activeProjectId
            && projectsQuery.data.some((project) => project.id === workspaceState.activeProjectId)
        )
            return;
        dispatch({ type: 'selectProject', projectId: projectsQuery.data[0].id });
    }, [projectsQuery.data, projectsQuery.isFetching, projectsQuery.isLoading, workspaceState.activeProjectId]);

    useEffect(() => {
        if (workspaceState.activeProjectId) {
            history.replaceState(
                null,
                '',
                `/workspace/projects/${workspaceState.activeProjectId}/${workspaceState.activeModule}${location.search}`,
            );
        }
    }, [workspaceState.activeProjectId, workspaceState.activeModule]);

    useEffect(() => {
        if (!workspaceState.selectedRequirementId) return;
        if (!requirementsQuery.data.some((requirement) => requirement.id === workspaceState.selectedRequirementId)) {
            dispatch({ type: 'selectRequirement', requirementId: null });
        }
    }, [requirementsQuery.data, workspaceState.selectedRequirementId]);

    useEffect(() => {
        if (!workspaceState.activeProjectId || workspaceState.selectedRequirementId) return;
        if (requirementsQuery.data.length === 0) return;
        dispatch({ type: 'selectRequirement', requirementId: requirementsQuery.data[0].id });
    }, [requirementsQuery.data, workspaceState.activeProjectId, workspaceState.selectedRequirementId]);

    const projects = projectsQuery.data;
    const projectAvailability = deriveProjectAvailability(
        workspaceState.activeProjectId,
        projects,
        projectsQuery.isLoading || projectsQuery.isFetching,
    );

    const createProjectMutation = useCreateProjectMutation(queryClient);
    const createCategoryMutation = useCreateCategoryMutation(queryClient, () =>
        dispatch({ type: 'setMode', mode: 'workspace' }),
    );
    const lookupMutation = useRequirementLookupMutation();
    const activeProject = projectAvailability.activeProject;
    const createRequirementMutation = useMutation({
        mutationFn: (values: Parameters<typeof createRequirement>[0]) => createRequirement(values),
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
    const editRequirementMutation = useEditRequirementMutation({
        queryClient,
        projectId: workspaceState.activeProjectId,
        getCurrentRequirement: () =>
            workspaceState.activeAppTabId === 'workspace' ? detailQuery.data : tabDetailQuery.data,
        onEdited: () => dispatch({ type: 'setMode', mode: 'workspace' }),
    });
    const lifecycleMutation = useRequirementLifecycleMutation({
        queryClient,
        onDeleted: (requirementId) => {
            if (workspaceState.selectedRequirementId === requirementId)
                dispatch({ type: 'selectRequirement', requirementId: null });
            const deletedTab = workspaceState.openRequirementTabs.find((tab) => tab.requirementId === requirementId);
            if (deletedTab) dispatch({ type: 'closeTab', tabId: deletedTab.id });
            dispatch({ type: 'setMode', mode: 'workspace' });
        },
        onUpdated: (requirement) => dispatch({ type: 'selectRequirement', requirementId: requirement.id }),
    });

    const handleLifecycleAction = (command: RequirementLifecycleCommand, requirement: typeof detailQuery.data) => {
        if (!requirement) return;

        if (command === 'approve') {
            if (confirm(`Approve ${requirement.visibleKey}?`)) lifecycleMutation.mutate({ command, requirement });
            return;
        }

        if (command === 'reject') {
            const rejectionReason = prompt(`Why should ${requirement.visibleKey} be rejected?`)?.trim();
            if (!rejectionReason) return;
            const reviewer = prompt('Reviewer name')?.trim();
            if (!reviewer) return;
            lifecycleMutation.mutate({ command, requirement, rejectionReason, reviewer });
            return;
        }

        if (command === 'markImplemented') {
            if (confirm(`Mark ${requirement.visibleKey} implemented?`))
                lifecycleMutation.mutate({ command, requirement });
            return;
        }

        if (command === 'markObsolete') {
            const obsolescenceReason = prompt(`Why is ${requirement.visibleKey} obsolete?`)?.trim();
            if (!obsolescenceReason) return;
            lifecycleMutation.mutate({ command, requirement, obsolescenceReason });
            return;
        }

        if (confirm(`Delete draft requirement ${requirement.visibleKey}?`))
            lifecycleMutation.mutate({ command, requirement });
    };

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
                : projectAvailability.state === 'unavailable' ?
                    'The project in the URL is not available.'
                :   null
            }
            projectContentLoading={requirementsQuery.isFetching || categoriesQuery.isFetching}
            requirementDetailLoading={detailQuery.isFetching}
            requirementDetailError={detailQuery.isError ? mapApiError(detailQuery.error).message : null}
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
                        && projectAvailability.canUseProject
                        && !categoriesQuery.isError
                        && categoriesQuery.data.length > 0,
                    )}
                    createUnavailableReason={
                        projectAvailability.message
                        ?? (categoriesQuery.isError ? 'Categories could not be loaded.'
                        : categoriesQuery.data.length === 0 ? 'Create a category before creating a requirement.'
                        : 'Select a project to continue.')
                    }
                    lookupMessage={lookupMessage}
                    lookupPending={lookupMutation.isPending}
                    lifecycleMessage={
                        lifecycleMutation.isError ? mapApiError(lifecycleMutation.error).message
                        : lifecycleMutation.isSuccess ?
                            'Requirement lifecycle updated.'
                        :   null
                    }
                    lifecyclePending={lifecycleMutation.isPending}
                    onLifecycleAction={(command, requirement) => handleLifecycleAction(command, requirement)}
                    onLookup={(visibleKey) => {
                        setLookupMessage(null);
                        const normalizedVisibleKey = visibleKey.trim().toUpperCase();
                        if (!validateVisibleKey(normalizedVisibleKey)) {
                            setLookupMessage('Enter a valid requirement key, for example FR-UI-0001.');
                            return;
                        }
                        lookupMutation.mutate(normalizedVisibleKey);
                    }}
                    dispatch={dispatch}
                />
            }
            dispatch={dispatch}
            onCreateProject={(formData) => createProjectMutation.mutate(formValue(formData, 'name'))}
            createProjectError={
                createProjectMutation.error instanceof ProjectCreationUnavailableError ?
                    createProjectMutation.error.message
                : createProjectMutation.error ?
                    mapApiError(createProjectMutation.error).message
                :   null
            }
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
            onCreateRequirement={(values) =>
                createRequirementMutation.mutate({ ...values, projectId: workspaceState.activeProjectId ?? undefined })
            }
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
            initialComparison={
                directComparison?.pair.ok ? location.pathname.split('/').at(-1)
                : directComparison ?
                    'invalid'
                :   null
            }
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
                    lifecycleMessage={
                        lifecycleMutation.isError ? mapApiError(lifecycleMutation.error).message
                        : lifecycleMutation.isSuccess ?
                            'Requirement lifecycle updated.'
                        :   null
                    }
                    lifecyclePending={lifecycleMutation.isPending}
                    onLifecycleAction={(command, requirement) => handleLifecycleAction(command, requirement)}
                    dispatch={dispatch}
                />
                {tabDetailQuery.isError ?
                    <div className='workspace-state state'>{mapApiError(tabDetailQuery.error).message}</div>
                :   null}
                {tabDetailQuery.isFetching ?
                    <div className='workspace-state state'>Loading requirement detail…</div>
                :   null}
                {tabDetailQuery.data && workspaceState.mode === 'historyTab' ?
                    <RequirementHistory
                        requirement={tabDetailQuery.data}
                        onClose={() => dispatch({ type: 'setMode', mode: 'workspace' })}
                        initialComparison={
                            directComparison?.pair.ok ? location.pathname.split('/').at(-1)
                            : directComparison ?
                                'invalid'
                            :   null
                        }
                    />
                : tabDetailQuery.data && workspaceState.mode === 'editRequirementTab' ?
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
                    <RequirementDetail
                        requirement={tabDetailQuery.data}
                        onOpenRequirement={(requirementId: string, visibleKey: string) =>
                            dispatch({ type: 'openRequirementTab', requirementId, visibleKey })
                        }
                    />
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
