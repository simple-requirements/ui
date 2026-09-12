import { Splitter, SplitterPanel } from 'primereact/splitter';
import { useParams } from 'react-router';

import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { RequirementTable } from '@/pages/ProjectRequirements/List/RequirementTable';
import { useProjectRequirementsList } from '@/pages/ProjectRequirements/List/useProjectRequirementsList';
import {
    type RequirementListActions,
    useRequirementListActions,
} from '@/pages/ProjectRequirements/List/useRequirementListActions';
import { useSelectedRequirementActionBar } from '@/pages/ProjectRequirements/List/useSelectedRequirementActionBar';
import { RequirementDetailsPanel } from '@/pages/ProjectRequirements/RequirementDetailsPanel';

import '@/pages/ProjectRequirements/List/ListPage.scss';

export function ListPage() {
    const { projectId } = useParams();
    const { requirements, requirementsQuery, selectedRequirement, selectedRequirementId, setSelectedRequirementId } =
        useProjectRequirementsList(projectId);
    useSelectedRequirementActionBar(projectId, selectedRequirement);
    const actions: RequirementListActions = useRequirementListActions({
        projectId,
        requirements,
        setSelectedRequirementId,
    });

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
                                onSelectRequirement={actions.selectRequirement}
                                onCopyRequirementKey={(requirement) => {
                                    void actions.copyRequirementKey(requirement);
                                }}
                                onOpenRequirement={actions.openRequirement}
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
                    />
                </SplitterPanel>
            </Splitter>
        </section>
    );
}
