import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { ActionBar } from '@/components/ActionBar';
import { AppTabBar } from '@/components/AppTabBar';
import { RequirementsList } from '@/components/RequirementsList';
import { Workspace } from '@/components/Workspace';
import { createDemoRepositories } from '@/demo/demoRepositories';
import { createCategoriesStore } from '@/stores/categoriesStore';
import { createProjectsStore } from '@/stores/projectsStore';
import { createRequirementsStore } from '@/stores/requirementsStore';
import type { Category, DemoRequirement, Priority, ProjectSummary } from '@/demo/demoTypes';
import { RequirementDetail } from '@/features/requirements/RequirementDetail';
import { LoadingOverlay } from '@/layout/LoadingOverlay';
import { loadWorkspaceState, saveWorkspaceState } from '@/state/sessionPersistence';
import { workspaceReducer } from '@/state/workspaceReducer';

const lifecycleTransitionByLabel: Record<string, DemoRequirement['status']> = {
    Approve: 'approved',
    Reject: 'rejected',
    'Mark implemented': 'implemented',
    'Mark obsolete': 'obsolete',
};

function formValue(formData: FormData, fieldName: string) {
    const value = formData.get(fieldName);
    return typeof value === 'string' ? value : '';
}

export default function App() {
    const demoRepository = useMemo(() => createDemoRepositories(), []);
    const projectsStore = useMemo(() => createProjectsStore(demoRepository), [demoRepository]);
    const requirementsStore = useMemo(() => createRequirementsStore(demoRepository), [demoRepository]);
    const categoriesStore = useMemo(() => createCategoriesStore(demoRepository), [demoRepository]);
    const [workspaceState, dispatch] = useReducer(workspaceReducer, undefined, loadWorkspaceState);
    const [bootstrapping, setBootstrapping] = useState(true);
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [requirements, setRequirements] = useState<DemoRequirement[]>([]);
    const [selectedRequirement, setSelectedRequirement] = useState<DemoRequirement | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [rightPaneError, setRightPaneError] = useState<string | null>(null);
    const [projectContentLoading, setProjectContentLoading] = useState(false);
    const [requirementDetailLoading, setRequirementDetailLoading] = useState(false);

    useEffect(() => saveWorkspaceState(workspaceState), [workspaceState]);

    async function loadProjects() {
        setBootstrapping(true);
        setRightPaneError(null);
        try {
            const loadedProjects = await projectsStore.loadProjects();
            setProjects(loadedProjects);
            if (!workspaceState.activeProjectId && loadedProjects[0]) {
                dispatch({ type: 'selectProject', projectId: loadedProjects[0].id });
            }
        } catch (error) {
            setProjects([]);
            setRightPaneError((error as Error).message);
        } finally {
            setBootstrapping(false);
        }
    }

    useEffect(() => {
        void loadProjects();
        void categoriesStore.loadCategories().then(setCategories);
    }, []);

    useEffect(() => {
        const activeProjectId = workspaceState.activeProjectId;
        if (!activeProjectId) {
            return;
        }

        setProjectContentLoading(true);
        setRightPaneError(null);
        requirementsStore
            .loadRequirements(activeProjectId)
            .then((loadedRequirements) => {
                setRequirements([...loadedRequirements]);
                const selectedRequirementId =
                    workspaceState.selectedRequirementId &&
                    loadedRequirements.some((requirement) => requirement.id === workspaceState.selectedRequirementId)
                        ? workspaceState.selectedRequirementId
                        : (loadedRequirements[0]?.id ?? null);
                dispatch({ type: 'selectRequirement', requirementId: selectedRequirementId });
                history.replaceState(
                    null,
                    '',
                    `/workspace/projects/${activeProjectId}/${workspaceState.activeModule}`,
                );
            })
            .catch((error: unknown) => {
                setRequirements([]);
                setRightPaneError((error as Error).message);
            })
            .finally(() => setProjectContentLoading(false));
    }, [workspaceState.activeProjectId, workspaceState.activeModule]);

    useEffect(() => {
        if (!workspaceState.selectedRequirementId) {
            setSelectedRequirement(null);
            return;
        }

        setRequirementDetailLoading(true);
        requirementsStore
            .loadRequirementDetail(workspaceState.selectedRequirementId)
            .then(setSelectedRequirement)
            .catch((error: unknown) => {
                setSelectedRequirement(null);
                setRightPaneError((error as Error).message);
            })
            .finally(() => setRequirementDetailLoading(false));
    }, [workspaceState.selectedRequirementId]);

    const activeRequirementTab = workspaceState.openRequirementTabs.find(
        (tab) => tab.id === workspaceState.activeAppTabId,
    );

    function refreshWorkspace() {
        void loadProjects();
        const currentActiveProjectId = workspaceState.activeProjectId;
        if (currentActiveProjectId) {
            void requirementsStore
                .loadRequirements(currentActiveProjectId)
                .then((loadedRequirements) => setRequirements([...loadedRequirements]));
        }
    }

    async function createProject(formData: FormData) {
        const project = await projectsStore.createProject({ name: formValue(formData, 'name') });
        setProjects(await projectsStore.loadProjects());
        dispatch({ type: 'selectProject', projectId: project.id });
    }

    async function createRequirement(formData: FormData) {
        if (!workspaceState.activeProjectId) {
            return;
        }

        const requirement = await requirementsStore.createRequirement(workspaceState.activeProjectId, {
            categoryKey: formValue(formData, 'category'),
            description: formValue(formData, 'description'),
            priority: formValue(formData, 'priority') as Priority,
            owner: formValue(formData, 'owner') || null,
            rationale: formValue(formData, 'rationale') || null,
            source: formValue(formData, 'source') || null,
        });
        dispatch({ type: 'setMode', mode: 'workspace' });
        dispatch({ type: 'selectRequirement', requirementId: requirement.id });
        refreshWorkspace();
    }

    async function transitionRequirement(actionLabel: string) {
        if (!selectedRequirement) {
            return;
        }

        await requirementsStore.transitionRequirement(selectedRequirement.id, lifecycleTransitionByLabel[actionLabel]);
        refreshWorkspace();
    }

    async function deleteDraftRequirement() {
        if (selectedRequirement && confirm('Delete draft requirement?')) {
            await requirementsStore.deleteDraftRequirement(selectedRequirement.id);
            dispatch({ type: 'selectRequirement', requirementId: null });
            refreshWorkspace();
        }
    }

    const workspaceActionBar = (
        <ActionBar
            activeProjectId={workspaceState.activeProjectId}
            selectedRequirement={selectedRequirement}
            dispatch={dispatch}
            onTransition={(actionLabel) => void transitionRequirement(actionLabel)}
            onDeleteDraft={() => void deleteDraftRequirement()}
        />
    );

    const dedicatedActionBar = (
        <ActionBar
            activeProjectId={workspaceState.activeProjectId}
            selectedRequirement={selectedRequirement}
            dedicated
            dispatch={dispatch}
            onTransition={(actionLabel) => void transitionRequirement(actionLabel)}
            onDeleteDraft={() => void deleteDraftRequirement()}
        />
    );

    const requirementsList = (
        <RequirementsList
            requirements={requirements}
            selectedRequirementId={workspaceState.selectedRequirementId}
            dispatch={dispatch}
        />
    );

    const workspace = (
        <Workspace
            projects={projects}
            activeProjectId={workspaceState.activeProjectId}
            mode={workspaceState.mode}
            activeModule={workspaceState.activeModule}
            selectedRequirementId={workspaceState.selectedRequirementId}
            splitterPosition={workspaceState.splitterPosition}
            categories={categories}
            projectError={rightPaneError}
            projectContentLoading={projectContentLoading}
            requirementDetailLoading={requirementDetailLoading}
            selectedRequirement={selectedRequirement}
            requirementsList={requirementsList}
            actionBar={workspaceActionBar}
            dispatch={dispatch}
            onCreateProject={(formData) => void createProject(formData)}
            onCreateRequirement={(formData) => void createRequirement(formData)}
            onRetry={refreshWorkspace}
        />
    );

    return (
        <div className="app-shell">
            <AppTabBar
                activeAppTabId={workspaceState.activeAppTabId}
                openRequirementTabs={workspaceState.openRequirementTabs}
                dispatch={dispatch}
            />
            <section className="panel" role="tabpanel">
                {activeRequirementTab ? (
                    <main className="dedicated">
                        {dedicatedActionBar}
                        {rightPaneError ? (
                            <div className="state">
                                {rightPaneError}
                                <Button type="button" label="Retry" onClick={refreshWorkspace} />
                            </div>
                        ) : selectedRequirement ? (
                            <RequirementDetail requirement={selectedRequirement} />
                        ) : (
                            <div className="state">Loading requirement detail…</div>
                        )}
                    </main>
                ) : (
                    workspace
                )}
            </section>
            {bootstrapping ? <LoadingOverlay /> : null}
        </div>
    );
}
