import { formatStatus } from '@/pages/ProjectRequirements/List/requirementFormatters';
import { RequirementStatusBadge } from '@/pages/ProjectRequirements/RequirementStatusBadge';
import { requirementStatuses, type RequirementStatusStatistics } from '@/pages/ProjectDetails/useProjectDetails';

type ProjectStatisticsProps = Readonly<{
    categoriesCount: number;
    requirementsCount: number;
    statusStatistics: RequirementStatusStatistics;
}>;

export function ProjectStatistics({ categoriesCount, requirementsCount, statusStatistics }: ProjectStatisticsProps) {
    return (
        <section
            className='project-details-page__statistics'
            aria-labelledby='project-details-page-statistics-title'>
            <h2
                id='project-details-page-statistics-title'
                className='project-details-page__section-title'>
                Statistics
            </h2>
            <div className='project-details-page__summary-grid'>
                <div
                    className='project-details-page__summary-card'
                    role='group'
                    aria-label='Categories summary'>
                    <span className='project-details-page__summary-value'>{categoriesCount}</span>
                    <span className='project-details-page__summary-label'>Categories</span>
                </div>
                <div
                    className='project-details-page__summary-card'
                    role='group'
                    aria-label='Requirements summary'>
                    <span className='project-details-page__summary-value'>{requirementsCount}</span>
                    <span className='project-details-page__summary-label'>Requirements</span>
                </div>
            </div>
            <dl className='project-details-page__status-list'>
                {requirementStatuses.map((status) => (
                    <div
                        key={status}
                        className='project-details-page__status-row'
                        role='group'
                        aria-label={`${formatStatus(status)} requirements`}>
                        <dt>
                            <RequirementStatusBadge status={status} />
                        </dt>
                        <dd>{statusStatistics[status]}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
