import { Splitter, SplitterPanel } from 'primereact/splitter';
import { useMemo } from 'react';
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
import { ReviewAssignmentDialog } from '@/pages/ProjectRequirements/Review/ReviewAssignmentDialog';

import '@/pages/ProjectRequirements/List/ListPage.scss';

export function ListPage() {
    const { projectId } = useParams();
    const {
        categories,
        canManageRequirements,
        requirements,
        requirementsQuery,
        selectedRequirement,
        selectedRequirementId,
        setSelectedRequirementId,
    } = useProjectRequirementsList(projectId);
    useSelectedRequirementActionBar(projectId, selectedRequirement);
    const actions: RequirementListActions = useRequirementListActions({
        projectId,
        requirements,
        setSelectedRequirementId,
    });
    const categoriesById = useMemo(
        () => new Map(categories.map((category) => [category.id, { name: category.name, type: category.type }])),
        [categories],
    );

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
                    <div className='project-requirements-list-page__list-panel ui-panel ui-panel--full-height ui-panel--flex-column ui-panel--overflow-hidden'>
                        <header className='project-requirements-list-page__header ui-panel__header'>
                            <h1
                                id='project-requirements-list-page-title'
                                className='project-requirements-list-page__title ui-panel__title'>
                                Requirements
                            </h1>
                            <span className='project-requirements-list-page__result-count'>{requirements.length}</span>
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
                                categoriesById={categoriesById}
                                canManageRequirements={canManageRequirements}
                                onSelectRequirement={actions.selectRequirement}
                                onCopyRequirementKey={(requirement) => {
                                    void actions.copyRequirementKey(requirement);
                                }}
                                onOpenRequirement={actions.openRequirement}
                                onOpenRequirementReview={actions.openRequirementReview}
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
            {selectedRequirement !== undefined && (
                <ReviewAssignmentDialog
                    projectId={projectId}
                    requirementId={selectedRequirement.id}
                />
            )}
        </section>
    );
}
