import { Card } from 'primereact/card';
import { Link, useParams } from 'react-router';

import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { useProjectPermissions } from '@/auth/projectPermissions';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { getProjectCategoriesRoute, getProjectRequirementsRoute } from '@/router/projectRoutes';
import { ProjectStatistics } from '@/pages/ProjectDetails/ProjectStatistics';
import { useProjectDetails } from '@/pages/ProjectDetails/useProjectDetails';
import { TicketSystemSettings } from '@/pages/ProjectDetails/TicketSystemSettings';
import { formatDateTime } from '@/utils/displayFormatters';

import '@/pages/ProjectDetails/ProjectDetailsPage.scss';


export function ProjectDetailsPage() {
    const { projectId } = useParams();
    const details = useProjectDetails(projectId);
    const permissions = useProjectPermissions(projectId);

    if (projectId === undefined) {
        return (
            <section className="project-details-page">
                <InlineStatus kind="error">Project route is missing a project id.</InlineStatus>
            </section>
        );
    }

    return (
        <section className="project-details-page" aria-labelledby="project-details-page-title">
            <LoadableContent
                loading={details.loading}
                error={details.error}
                empty={details.project === undefined}
                loadingMessage="Loading project details …"
                errorMessage="Project details could not be loaded."
                emptyMessage="Project could not be found."
            >
                {details.project !== undefined && (
                    <div className="project-details-page__content">
                        <header className="project-details-page__header">
                            <div>
                                <p className="project-details-page__eyebrow">Project</p>
                                <h1 id="project-details-page-title" className="project-details-page__title">
                                    {details.project.name}
                                </h1>
                            </div>

                            <dl className="project-details-page__meta-list">
                                <div className="project-details-page__meta-row">
                                    <dt>Created</dt>
                                    <dd>{formatDateTime(details.project.createdAt)}</dd>
                                </div>
                                <div className="project-details-page__meta-row">
                                    <dt>Updated</dt>
                                    <dd>{formatDateTime(details.project.updatedAt)}</dd>
                                </div>
                            </dl>
                        </header>

                        <div className="project-details-page__link-grid">
                            <Card pt={{ root: { className: 'project-details-page__link-card' } }}>
                                <h2 className="project-details-page__card-title">Categories</h2>
                                <p className="project-details-page__card-text">
                                    Maintain requirement category keys and types.
                                </p>
                                <Link
                                    className="project-details-page__card-link"
                                    to={getProjectCategoriesRoute(projectId)}
                                >
                                    Open categories
                                </Link>
                            </Card>

                            <Card pt={{ root: { className: 'project-details-page__link-card' } }}>
                                <h2 className="project-details-page__card-title">Requirements</h2>
                                <p className="project-details-page__card-text">
                                    Open the current requirement revisions of this project.
                                </p>
                                <Link
                                    className="project-details-page__card-link"
                                    to={getProjectRequirementsRoute(projectId)}
                                >
                                    Open requirements
                                </Link>
                            </Card>
                        </div>

                        <ProjectStatistics
                            categoriesCount={details.categoriesCount}
                            requirementsCount={details.requirementsCount}
                            statusStatistics={details.requirementStatusStatistics}
                        />
                        {permissions.canAdministerProject && (
                            <TicketSystemSettings project={details.project} />
                        )}
                    </div>
                )}
            </LoadableContent>
        </section>
    );
}
