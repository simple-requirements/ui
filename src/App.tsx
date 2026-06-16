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
    'Approve': 'approved',
    'Reject': 'rejected',
    'Mark implemented': 'implemented',
    'Mark obsolete': 'obsolete',
};

function formValue(formData: FormData, fieldName: string) {
    const value = formData.get(fieldName);
    return typeof value === 'string' ? value : '';
}

/** Coordinates demo repositories, workspace state, and top-level application layout. */
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

    const loadProjects = async () => {
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
    };

    useEffect(() => {
        const bootstrapWorkspace = async () => {
            await loadProjects();
            const loadedCategories = await categoriesStore.loadCategories();
            setCategories(loadedCategories);
        };

        void bootstrapWorkspace();
    }, []);

    useEffect(() => {
        const loadProjectContent = async (activeProjectId: string) => {
            setProjectContentLoading(true);
            setRightPaneError(null);
            try {
                const loadedRequirements = await requirementsStore.loadRequirements(activeProjectId);
                setRequirements([...loadedRequirements]);
                const selectedRequirementId =
                    (
                        workspaceState.selectedRequirementId
                        && loadedRequirements.some(
                            (requirement) => requirement.id === workspaceState.selectedRequirementId,
                        )
                    ) ?
                        workspaceState.selectedRequirementId
                    :   (loadedRequirements[0]?.id ?? null);
                dispatch({ type: 'selectRequirement', requirementId: selectedRequirementId });
                history.replaceState(null, '', `/workspace/projects/${activeProjectId}/${workspaceState.activeModule}`);
            } catch (error) {
                setRequirements([]);
                setRightPaneError((error as Error).message);
            } finally {
                setProjectContentLoading(false);
            }
        };

        const activeProjectId = workspaceState.activeProjectId;
        if (activeProjectId) {
            void loadProjectContent(activeProjectId);
        }
    }, [workspaceState.activeProjectId, workspaceState.activeModule]);

    useEffect(() => {
        const loadRequirementDetail = async (requirementId: string) => {
            setRequirementDetailLoading(true);
            try {
                const requirementDetail = await requirementsStore.loadRequirementDetail(requirementId);
                setSelectedRequirement(requirementDetail);
            } catch (error) {
                setSelectedRequirement(null);
                setRightPaneError((error as Error).message);
            } finally {
                setRequirementDetailLoading(false);
            }
        };

        if (!workspaceState.selectedRequirementId) {
            setSelectedRequirement(null);
            return;
        }

        void loadRequirementDetail(workspaceState.selectedRequirementId);
    }, [workspaceState.selectedRequirementId]);

    const activeRequirementTab = workspaceState.openRequirementTabs.find(
        (tab) => tab.id === workspaceState.activeAppTabId,
    );

    const refreshWorkspace = async () => {
        await loadProjects();
        const currentActiveProjectId = workspaceState.activeProjectId;
        if (currentActiveProjectId) {
            const loadedRequirements = await requirementsStore.loadRequirements(currentActiveProjectId);
            setRequirements([...loadedRequirements]);
        }
    };

    const createProject = async (formData: FormData) => {
        const project = await projectsStore.createProject({ name: formValue(formData, 'name') });
        setProjects(await projectsStore.loadProjects());
        dispatch({ type: 'selectProject', projectId: project.id });
    };

    const createRequirement = async (formData: FormData) => {
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
        void refreshWorkspace();
    };

    const handleTransitionRequirement = async (actionLabel: string) => {
        if (!selectedRequirement) {
            return;
        }

        await requirementsStore.transitionRequirement(selectedRequirement.id, lifecycleTransitionByLabel[actionLabel]);
        void refreshWorkspace();
    };

    const handleDeleteDraftRequirement = async () => {
        if (selectedRequirement && confirm('Delete draft requirement?')) {
            await requirementsStore.deleteDraftRequirement(selectedRequirement.id);
            dispatch({ type: 'selectRequirement', requirementId: null });
            void refreshWorkspace();
        }
    };

    const workspaceActionBar = (
        <ActionBar
            activeProjectId={workspaceState.activeProjectId}
            selectedRequirement={selectedRequirement}
            dispatch={dispatch}
            onTransition={(actionLabel) => void handleTransitionRequirement(actionLabel)}
            onDeleteDraft={() => void handleDeleteDraftRequirement()}
        />
    );

    const dedicatedActionBar = (
        <ActionBar
            activeProjectId={workspaceState.activeProjectId}
            selectedRequirement={selectedRequirement}
            dedicated
            dispatch={dispatch}
            onTransition={(actionLabel) => void handleTransitionRequirement(actionLabel)}
            onDeleteDraft={() => void handleDeleteDraftRequirement()}
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
            onRetry={() => void refreshWorkspace()}
        />
    );

    const renderDedicatedRequirementTab = () => {
        if (rightPaneError) {
            return (
                <div className='workspace-state state'>
                    {rightPaneError}
                    <Button
                        type='button'
                        label='Retry'
                        onClick={() => void refreshWorkspace()}
                    />
                </div>
            );
        }

        if (selectedRequirement) {
            return <RequirementDetail requirement={selectedRequirement} />;
        }

        return <div className='workspace-state state'>Loading requirement detail…</div>;
    };

    const renderActivePanel = () => {
        if (!activeRequirementTab) {
            return workspace;
        }

        return (
            <main className='workspace-dedicated dedicated'>
                {dedicatedActionBar}
                {renderDedicatedRequirementTab()}
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
            {bootstrapping ?
                <LoadingOverlay />
            :   null}
        </div>
    );
}
