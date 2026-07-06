import { eq, useLiveQuery } from '@tanstack/react-db';
import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';

import { getProjectCategoriesCollection } from '@/api/collections/projectCategoriesCollection';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { getProjectCategoriesRoute, getProjectRequirementsRoute } from '@/router/projectRoutes';

import '@/pages/ProjectRequirements/FormPage.scss';

export function FormPage() {
    const { projectId } = useParams();
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get('categoryId') ?? undefined;

    const categoriesCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectCategoriesCollection(projectId)),
        [projectId],
    );

    const categoryQuery = useLiveQuery(
        (query) => {
            if (categoriesCollection === undefined || categoryId === undefined) {
                return undefined;
            }

            return query
                .from({ categories: categoriesCollection })
                .where(({ categories }) => eq(categories.id, categoryId))
                .findOne();
        },
        [categoriesCollection, categoryId],
    );

    if (projectId === undefined) {
        return (
            <section className='project-requirements-form-page'>
                <InlineStatus kind='error'>Project route is missing a project id.</InlineStatus>
            </section>
        );
    }

    return (
        <section
            className='project-requirements-form-page'
            aria-labelledby='project-requirements-form-page-title'>
            <h1
                id='project-requirements-form-page-title'
                className='project-requirements-form-page__title'>
                Create requirement
            </h1>

            <div className='project-requirements-form-page__content-box'>
                <p className='project-requirements-form-page__intro'>
                    Requirement creation is not implemented yet. This placeholder keeps the route and category context in place.
                </p>

                {categoryId === undefined ? (
                    <InlineStatus kind='info'>No source category was selected.</InlineStatus>
                ) : (
                    <LoadableContent
                        loading={categoryQuery.isLoading}
                        error={categoryQuery.isError}
                        empty={categoryQuery.data === undefined}
                        loadingMessage='Loading category …'
                        errorMessage='Category could not be loaded.'
                        emptyMessage='The selected category could not be found.'>
                        <dl className='project-requirements-form-page__metadata'>
                            <div className='project-requirements-form-page__metadata-row'>
                                <dt>Category</dt>
                                <dd>{categoryQuery.data?.key}</dd>
                            </div>
                            <div className='project-requirements-form-page__metadata-row'>
                                <dt>Category name</dt>
                                <dd>{categoryQuery.data?.name}</dd>
                            </div>
                            <div className='project-requirements-form-page__metadata-row'>
                                <dt>Type</dt>
                                <dd>{categoryQuery.data?.type}</dd>
                            </div>
                        </dl>
                    </LoadableContent>
                )}

                <nav
                    className='project-requirements-form-page__links'
                    aria-label='Requirement creation navigation'>
                    <Link to={getProjectRequirementsRoute(projectId)}>Back to requirements</Link>
                    <Link to={getProjectCategoriesRoute(projectId)}>Back to categories</Link>
                </nav>
            </div>
        </section>
    );
}
