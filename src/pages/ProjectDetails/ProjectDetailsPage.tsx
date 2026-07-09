import { eq, useLiveQuery } from '@tanstack/react-db';
import { Card } from 'primereact/card';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router';

import { getProjectCategoriesCollection } from '@/api/collections/projectCategoriesCollection';
import { getProjectRequirementsCollection } from '@/api/collections/projectRequirementsCollection';
import { projectsCollection } from '@/api/collections/projectsCollection';
import { type RequirementStatus, requirementStatusSchema } from '@/api/requirementsApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { getProjectCategoriesRoute, getProjectRequirementsRoute } from '@/router/projectRoutes';

import { RequirementStatusBadge } from '@/pages/ProjectRequirements/RequirementStatusBadge';

import '@/pages/ProjectDetails/ProjectDetailsPage.scss';

const requirementStatuses = requirementStatusSchema.options;

type RequirementStatusStatistics = Readonly<Record<RequirementStatus, number>>;

function createEmptyRequirementStatusStatistics(): RequirementStatusStatistics {
    return requirementStatuses.reduce<RequirementStatusStatistics>(
        (statistics, status) => ({ ...statistics, [status]: 0 }),
        { draft: 0, approved: 0, implemented: 0, obsolete: 0, rejected: 0 },
    );
}

function formatDateTime(value: string): string {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function ProjectDetailsPage() {
    const { projectId } = useParams();

    const projectQuery = useLiveQuery(
        (query) => {
            if (projectId === undefined) {
                return undefined;
            }

            return query.from({ projects: projectsCollection }).where(({ projects }) => eq(projects.id, projectId)).findOne();
        },
        [projectId],
    );

    const categoriesCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectCategoriesCollection(projectId)),
        [projectId],
    );
    const requirementsCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectRequirementsCollection(projectId)),
        [projectId],
    );

    const categoriesQuery = useLiveQuery(
        (query) => {
            if (categoriesCollection === undefined) {
                return undefined;
            }

            return query.from({ categories: categoriesCollection });
        },
        [categoriesCollection],
    );

    const requirementsQuery = useLiveQuery(
        (query) => {
            if (requirementsCollection === undefined) {
                return undefined;
            }

            return query.from({ requirements: requirementsCollection });
        },
        [requirementsCollection],
    );

    const project = projectQuery.data;
    const categories = categoriesQuery.data ?? [];
    const requirements = requirementsQuery.data ?? [];
    const requirementStatusStatistics = useMemo(
        () =>
            requirements.reduce<RequirementStatusStatistics>((statistics, requirement) => {
                const currentValue = statistics[requirement.status];

                return { ...statistics, [requirement.status]: currentValue + 1 };
            }, createEmptyRequirementStatusStatistics()),
        [requirements],
    );

    if (projectId === undefined) {
        return (
            <section className='project-details-page'>
                <InlineStatus kind='error'>Project route is missing a project id.</InlineStatus>
            </section>
        );
    }

    return (
        <section
            className='project-details-page'
            aria-labelledby='project-details-page-title'>
            <LoadableContent
                loading={projectQuery.isLoading || categoriesQuery.isLoading || requirementsQuery.isLoading}
                error={projectQuery.isError || categoriesQuery.isError || requirementsQuery.isError}
                empty={project === undefined}
                loadingMessage='Loading project details …'
                errorMessage='Project details could not be loaded.'
                emptyMessage='Project could not be found.'>
                {project !== undefined && (
                    <div className='project-details-page__content'>
                        <header className='project-details-page__header'>
                            <div>
                                <p className='project-details-page__eyebrow'>Project</p>
                                <h1
                                    id='project-details-page-title'
                                    className='project-details-page__title'>
                                    {project.name}
                                </h1>
                            </div>

                            <dl className='project-details-page__meta-list'>
                                <div className='project-details-page__meta-row'>
                                    <dt>Created</dt>
                                    <dd>{formatDateTime(project.createdAt)}</dd>
                                </div>
                                <div className='project-details-page__meta-row'>
                                    <dt>Updated</dt>
                                    <dd>{formatDateTime(project.updatedAt)}</dd>
                                </div>
                            </dl>
                        </header>

                        <div className='project-details-page__link-grid'>
                            <Card pt={{ root: { className: 'project-details-page__link-card' } }}>
                                <h2 className='project-details-page__card-title'>Categories</h2>
                                <p className='project-details-page__card-text'>Maintain requirement category keys and types.</p>
                                <Link
                                    className='project-details-page__card-link'
                                    to={getProjectCategoriesRoute(projectId)}>
                                    Open categories
                                </Link>
                            </Card>

                            <Card pt={{ root: { className: 'project-details-page__link-card' } }}>
                                <h2 className='project-details-page__card-title'>Requirements</h2>
                                <p className='project-details-page__card-text'>Open the current requirement revisions of this project.</p>
                                <Link
                                    className='project-details-page__card-link'
                                    to={getProjectRequirementsRoute(projectId)}>
                                    Open requirements
                                </Link>
                            </Card>
                        </div>

                        <section
                            className='project-details-page__statistics'
                            aria-labelledby='project-details-page-statistics-title'>
                            <h2
                                id='project-details-page-statistics-title'
                                className='project-details-page__section-title'>
                                Statistics
                            </h2>

                            <div className='project-details-page__summary-grid'>
                                <div className='project-details-page__summary-card'>
                                    <span className='project-details-page__summary-value'>{categories.length}</span>
                                    <span className='project-details-page__summary-label'>Categories</span>
                                </div>

                                <div className='project-details-page__summary-card'>
                                    <span className='project-details-page__summary-value'>{requirements.length}</span>
                                    <span className='project-details-page__summary-label'>Requirements</span>
                                </div>
                            </div>

                            <dl className='project-details-page__status-list'>
                                {requirementStatuses.map((status) => (
                                    <div
                                        key={status}
                                        className='project-details-page__status-row'>
                                        <dt>
                                            <RequirementStatusBadge status={status} />
                                        </dt>
                                        <dd>{requirementStatusStatistics[status]}</dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    </div>
                )}
            </LoadableContent>
        </section>
    );
}
