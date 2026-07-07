import { Splitter, SplitterPanel } from 'primereact/splitter';
import { useNavigate, useParams } from 'react-router';

import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { getProjectRequirementDetailsRoute, getProjectRequirementEditRoute } from '@/router/projectRoutes';
import { openTab } from '@/stores/tabBarStore';
import { showToastMessage } from '@/stores/toastStore';

import { RequirementTable } from '@/pages/ProjectRequirements/List/RequirementTable';
import type { RequirementTableRow } from '@/pages/ProjectRequirements/List/requirementListTypes';
import { useProjectRequirementsList } from '@/pages/ProjectRequirements/List/useProjectRequirementsList';
import { RequirementDetailsPanel } from '@/pages/ProjectRequirements/RequirementDetailsPanel';

import '@/pages/ProjectRequirements/List/ListPage.scss';

export function ListPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { requirements, requirementsQuery, selectedRequirement, selectedRequirementId, setSelectedRequirementId } =
        useProjectRequirementsList(projectId);

    async function copyRequirementKey(requirement: RequirementTableRow): Promise<void> {
        await navigator.clipboard.writeText(requirement.visibleKey);

        showToastMessage({
            severity: 'success',
            summary: 'Requirement key copied',
            detail: `${requirement.visibleKey} has been copied to the clipboard.`,
            life: 3000,
        });
    }

    function handleOpenRequirement(requirement: RequirementTableRow): void {
        if (projectId === undefined) {
            return;
        }

        const requirementDetailsRoute = getProjectRequirementDetailsRoute(projectId, requirement.id);

        setSelectedRequirementId(requirement.id);
        openTab({ id: requirementDetailsRoute, label: requirement.visibleKey, closable: true });
        void navigate(requirementDetailsRoute);
    }

    function handleEditRequirement(requirement: RequirementTableRow): void {
        if (projectId === undefined) {
            return;
        }

        const requirementDetailsRoute = getProjectRequirementDetailsRoute(projectId, requirement.id);
        const requirementEditRoute = getProjectRequirementEditRoute(projectId, requirement.id);

        openTab({ id: requirementDetailsRoute, label: requirement.visibleKey, closable: true });
        void navigate(requirementEditRoute);
    }

    if (projectId === undefined) {
        return (
            <section className='project-requirements-list-page'>
                <InlineStatus kind='error'>Project route is missing a project id.</InlineStatus>
            </section>
        );
    }

    return (
        <section
            className='project-requirements-list-page'
            aria-labelledby='project-requirements-list-page-title'>
            <Splitter
                layout='vertical'
                pt={{ root: { className: 'project-requirements-list-page__splitter' } }}>
                <SplitterPanel
                    size={67}
                    minSize={25}
                    pt={{ root: { className: 'project-requirements-list-page__splitter-panel' } }}>
                    <div className='project-requirements-list-page__list-panel'>
                        <header className='project-requirements-list-page__header'>
                            <h1
                                id='project-requirements-list-page-title'
                                className='project-requirements-list-page__title'>
                                Requirements
                            </h1>
                        </header>

                        <LoadableContent
                            loading={requirementsQuery.isLoading}
                            error={requirementsQuery.isError}
                            empty={requirements.length === 0}
                            loadingMessage='Loading requirements …'
                            errorMessage='Requirements could not be loaded.'
                            emptyMessage='No requirements available.'>
                            <RequirementTable
                                requirements={requirements}
                                selectedRequirement={selectedRequirement}
                                selectedRequirementId={selectedRequirementId}
                                onSelectRequirement={setSelectedRequirementId}
                                onCopyRequirementKey={(requirement) => {
                                    void copyRequirementKey(requirement);
                                }}
                                onOpenRequirement={handleOpenRequirement}
                            />
                        </LoadableContent>
                    </div>
                </SplitterPanel>

                <SplitterPanel
                    size={33}
                    minSize={20}
                    pt={{ root: { className: 'project-requirements-list-page__splitter-panel' } }}>
                    <RequirementDetailsPanel
                        requirement={selectedRequirement}
                        title='Requirement details'
                        onEditRequirement={handleEditRequirement}
                    />
                </SplitterPanel>
            </Splitter>
        </section>
    );
}
