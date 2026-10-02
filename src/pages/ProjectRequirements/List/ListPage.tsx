import { Splitter, SplitterPanel } from 'primereact/splitter';
import { useMemo } from 'react';
import { useParams } from 'react-router';

import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { RequirementDocumentView } from '@/pages/ProjectRequirements/List/RequirementDocumentView';
import { RequirementListFilters } from '@/pages/ProjectRequirements/List/RequirementListFilters';
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
    const {
        allRequirements,
        categories,
        filters,
        linksByRequirementId,
        requirements,
        requirementsQuery,
        selectedRequirement,
        selectedRequirementId,
        setFilters,
        setSelectedRequirementId,
        setView,
        setVisibleColumns,
        view,
        visibleColumns,
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
                            <span className='project-requirements-list-page__result-count'>
                                {requirements.length} of {allRequirements.length}
                            </span>
                        </header>
                        <RequirementListFilters
                            categories={categories}
                            requirements={allRequirements}
                            filters={filters}
                            view={view}
                            visibleColumns={visibleColumns}
                            onFiltersChange={setFilters}
                            onViewChange={setView}
                            onVisibleColumnsChange={setVisibleColumns}
                        />
                        <LoadableContent
                            loading={requirementsQuery.isLoading}
                            error={requirementsQuery.isError}
                            empty={requirements.length === 0}
                            loadingMessage='Loading requirements …'
                            errorMessage='Requirements could not be loaded.'
                            emptyMessage={
                                allRequirements.length === 0 ?
                                    'No requirements available.'
                                :   'No requirements match the current filters.'
                            }>
                            {view === 'table' ?
                                <RequirementTable
                                    requirements={requirements}
                                    selectedRequirement={selectedRequirement}
                                    selectedRequirementId={selectedRequirementId}
                                    categoriesById={categoriesById}
                                    visibleColumns={visibleColumns}
                                    onSelectRequirement={actions.selectRequirement}
                                    onCopyRequirementKey={(requirement) => {
                                        void actions.copyRequirementKey(requirement);
                                    }}
                                    onOpenRequirement={actions.openRequirement}
                                />
                            :   <RequirementDocumentView
                                    requirements={requirements}
                                    allRequirements={allRequirements}
                                    categories={categories}
                                    linksByRequirementId={linksByRequirementId}
                                    onOpenRequirement={actions.openRequirement}
                                />
                            }
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
