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
import { WORKSPACE_TAB_ID, workspaceReducer } from '@/state/workspaceReducer';
import { formValue } from '@/shared/forms/formData';
import { useEditRequirementMutation } from '@/features/requirements/api/editRequirementMutation';
import {
    useRequirementLifecycleMutation,
    type RequirementLifecycleCommand,
} from '@/features/requirements/api/requirementLifecycleMutation';
import { deriveProjectAvailability } from '@/features/projects/projectAvailability';
import { validateVisibleKey } from '@/features/requirements/api/requirementsApi';
import { parseRequirementComparisonPath } from '@/features/requirements/comparisonRefs';
import { ExportControls, type ExportDialogRequest } from '@/features/exports/components/ExportControls';
import { useConfirmDialog } from '@/shared/dialogs/ConfirmDialogProvider';
import { useToastMessages } from '@/shared/feedback/ToastProvider';
import type { ProjectSummary, RequirementView } from '@/types/domain';

/** Coordinates backend server state, workspace state, and top-level application layout. */
export default function App() {
    const queryClient = useQueryClient();
    const [workspaceState, dispatch] = useReducer(workspaceReducer, undefined, loadWorkspaceState);
    const [exportRequest, setExportRequest] = useState<ExportDialogRequest | null>(null);
    const { confirm } = useConfirmDialog();
    const { showToast } = useToastMessages();
    const directComparison = parseRequirementComparisonPath(location.pathname);
    const isDirectComparisonRoute = directComparison !== null;
    const directComparisonRequirementId = directComparison?.requirementId ?? null;
    const initialComparison =
        directComparison?.pair.ok ? location.pathname.split('/').at(-1)
        : directComparison ? 'invalid'
        : null;

    useEffect(() => saveWorkspaceState(workspaceState), [workspaceState]);

    useEffect(() => {
        if (!directComparisonRequirementId) return;
        dispatch({ type: 'activateTab', tabId: WORKSPACE_TAB_ID });
        dispatch({ type: 'selectRequirement', requirementId: directComparisonRequirementId });
        dispatch({ type: 'setMode', mode: 'history' });
    }, [directComparisonRequirementId]);

    const projectsQuery = useProjectsQuery();
    const categoriesQuery = useCategoriesQuery();
    const requirementsQuery = useProjectRequirementsQuery(workspaceState.activeProjectId);
    const detailQuery = useRequirementDetailQuery(workspaceState.selectedRequirementId);

    const activeRequirementTab = workspaceState.openRequirementTabs.find(
        (tab) => tab.id === workspaceState.activeAppTabId,
    );
    const tabDetailQuery = useRequirementDetailQuery(activeRequirementTab?.requirementId);

    useEffect(() => {
        if (isDirectComparisonRoute) return;
        if (projectsQuery.isLoading || projectsQuery.isFetching) return;
        if (projectsQuery.data.length === 0) return;
        if (
            workspaceState.activeProjectId
            && projectsQuery.data.some((project) => project.id === workspaceState.activeProjectId)
        )
            return;
        dispatch({ type: 'selectProject', projectId: projectsQuery.data[0].id });
    }, [
        isDirectComparisonRoute,
        projectsQuery.data,
        projectsQuery.isFetching,
        projectsQuery.isLoading,
        workspaceState.activeProjectId,
    ]);

    useEffect(() => {
        if (isDirectComparisonRoute) return;
        if (workspaceState.activeProjectId) {
            history.replaceState(
                null,
                '',
                `/workspace/projects/${workspaceState.activeProjectId}/${workspaceState.activeModule}${location.search}`,
            );
        }
    }, [isDirectComparisonRoute, workspaceState.activeProjectId, workspaceState.activeModule]);

    useEffect(() => {
        if (isDirectComparisonRoute) return;
        if (requirementsQuery.isLoading || requirementsQuery.isFetching) return;
        if (!workspaceState.selectedRequirementId) return;
        if (!requirementsQuery.data.some((requirement) => requirement.id === workspaceState.selectedRequirementId)) {
            dispatch({ type: 'selectRequirement', requirementId: null });
        }
    }, [
        isDirectComparisonRoute,
        requirementsQuery.data,
        requirementsQuery.isFetching,
        requirementsQuery.isLoading,
        workspaceState.selectedRequirementId,
    ]);

    useEffect(() => {
        if (isDirectComparisonRoute) return;
        if (requirementsQuery.isLoading || requirementsQuery.isFetching) return;
        if (!workspaceState.activeProjectId || workspaceState.selectedRequirementId) return;
        if (requirementsQuery.data.length === 0) return;
        dispatch({ type: 'selectRequirement', requirementId: requirementsQuery.data[0].id });
    }, [
        isDirectComparisonRoute,
        requirementsQuery.data,
        requirementsQuery.isFetching,
        requirementsQuery.isLoading,
        workspaceState.activeProjectId,
        workspaceState.selectedRequirementId,
    ]);

    const projects = projectsQuery.data;
    const projectAvailability = deriveProjectAvailability(
        workspaceState.activeProjectId,
        projects,
        projectsQuery.isLoading || projectsQuery.isFetching,
    );

    const createProjectMutation = useCreateProjectMutation(queryClient, (project) => {
        dispatch({ type: 'selectProject', projectId: project.id });
    });
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

    const handleLifecycleAction = async (
        command: RequirementLifecycleCommand,
        requirement: typeof detailQuery.data,
    ) => {
        if (!requirement) return;

        if (command === 'approve') {
            const confirmed = await confirm({
                title: 'Approve requirement',
                message: `Approve ${requirement.visibleKey}?`,
                acceptLabel: 'Approve',
            });
            if (confirmed) lifecycleMutation.mutate({ command, requirement });
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
            const confirmed = await confirm({
                title: 'Mark requirement implemented',
                message: `Mark ${requirement.visibleKey} implemented?`,
                acceptLabel: 'Mark implemented',
            });
            if (confirmed) lifecycleMutation.mutate({ command, requirement });
            return;
        }

        if (command === 'markObsolete') {
            const obsolescenceReason = prompt(`Why is ${requirement.visibleKey} obsolete?`)?.trim();
            if (!obsolescenceReason) return;
            lifecycleMutation.mutate({ command, requirement, obsolescenceReason });
            return;
        }

        const confirmed = await confirm({
            title: 'Delete draft requirement',
            message: `Delete draft requirement ${requirement.visibleKey}?`,
            acceptLabel: 'Delete',
            acceptSeverity: 'danger',
        });
        if (confirmed) lifecycleMutation.mutate({ command, requirement });
    };

    const openProjectExport = (project: ProjectSummary) => {
        setExportRequest({
            scope: 'project',
            title: `Export project ${project.name}`,
            description: `Export the project ${project.name} using one of the backend-supported formats.`,
            projectId: project.id,
        });
    };

    const openAllProjectsExport = () => {
        setExportRequest({
            scope: 'allProjects',
            title: 'Export all projects',
            description: 'Export all projects that the backend includes in the all-projects export scope.',
        });
    };

    const openRequirementsExport = (requirements: readonly RequirementView[]) => {
        if (requirements.length === 0) return;
        const visibleKeys = requirements.map((requirement) => requirement.visibleKey).join(', ');
        setExportRequest({
            scope: 'requirements',
            title:
                requirements.length === 1 ?
                    `Export ${visibleKeys}`
                :   `Export ${String(requirements.length)} requirements`,
            description: `Export the selected requirement${requirements.length === 1 ? '' : 's'}: ${visibleKeys}.`,
            requirementIds: requirements.map((requirement) => requirement.id),
        });
    };

    const openAllRequirementsExport = (requirements: readonly RequirementView[]) => {
        if (requirements.length === 0) return;
        setExportRequest({
            scope: 'requirements',
            title: 'Export all requirements',
            description: `Export all ${String(requirements.length)} requirements in the current list.`,
            requirementIds: requirements.map((requirement) => requirement.id),
        });
    };

    useEffect(() => {
        if (!lookupMutation.isSuccess) return;
        const requirement = lookupMutation.data;
        if (requirement.projectId && requirement.projectId !== workspaceState.activeProjectId) {
            showToast({
                severity: 'warn',
                summary: 'Requirement is in another project',
                detail: `Requirement ${requirement.visibleKey} belongs to project ${requirement.projectId}. Switch projects explicitly before opening it.`,
            });
            return;
        }
        dispatch({ type: 'selectRequirement', requirementId: requirement.id });
        showToast({
            severity: 'success',
            summary: 'Requirement selected',
            detail: `Selected ${requirement.visibleKey}.`,
        });
    }, [lookupMutation.isSuccess, lookupMutation.data, workspaceState.activeProjectId, showToast]);

    useEffect(() => {
        if (!lookupMutation.isError) return;
        showToast({ severity: 'error', summary: 'Lookup failed', detail: mapApiError(lookupMutation.error).message });
    }, [lookupMutation.isError, lookupMutation.error, showToast]);

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
                    lifecyclePending={lifecycleMutation.isPending}
                    onExportRequirements={openRequirementsExport}
                    onExportAllRequirements={openAllRequirementsExport}
                    onLifecycleAction={(command, requirement) => void handleLifecycleAction(command, requirement)}
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
                    lookupPending={lookupMutation.isPending}
                    lifecycleMessage={
                        lifecycleMutation.isError ? mapApiError(lifecycleMutation.error).message
                        : lifecycleMutation.isSuccess ?
                            'Requirement lifecycle updated.'
                        :   null
                    }
                    lifecyclePending={lifecycleMutation.isPending}
                    onLifecycleAction={(command, requirement) => void handleLifecycleAction(command, requirement)}
                    onLookup={(visibleKey) => {
                        const normalizedVisibleKey = visibleKey.trim().toUpperCase();
                        if (!validateVisibleKey(normalizedVisibleKey)) {
                            showToast({
                                severity: 'warn',
                                summary: 'Invalid requirement key',
                                detail: 'Enter a valid requirement key, for example FR-UI-0001.',
                            });
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
            onExportProject={openProjectExport}
            onExportAllProjects={openAllProjectsExport}
            initialComparison={initialComparison}
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
                    onLifecycleAction={(command, requirement) => void handleLifecycleAction(command, requirement)}
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
                        initialComparison={initialComparison}
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
                            if (!dirty) {
                                dispatch({ type: 'setMode', mode: 'workspace' });
                                return;
                            }
                            void confirm({
                                title: 'Discard unsaved changes',
                                message: 'Discard unsaved requirement changes?',
                                acceptLabel: 'Discard',
                                acceptSeverity: 'danger',
                            }).then((confirmed) => {
                                if (confirmed) dispatch({ type: 'setMode', mode: 'workspace' });
                            });
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
            <ExportControls
                visible={exportRequest !== null}
                request={exportRequest}
                onHide={() => setExportRequest(null)}
            />
            {projectsQuery.isLoading ?
                <LoadingOverlay />
            :   null}
        </div>
    );
}
