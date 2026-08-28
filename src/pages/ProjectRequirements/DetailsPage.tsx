import { eq, useLiveQuery } from '@tanstack/react-db';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { getProjectRequirementsCollection } from '@/api/collections/projectRequirementsCollection';
import { getReviewSummary } from '@/api/reviewApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { getProjectRequirementDetailsRoute, getProjectRequirementReviewRoute } from '@/router/projectRoutes';
import { clearReviewActionRequirement, setReviewActionRequirement } from '@/stores/actionBarStore';
import { openTab } from '@/stores/tabBarStore';

import { RequirementDetailsPanel } from '@/pages/ProjectRequirements/RequirementDetailsPanel';
import { ImplementationTicketsPanel } from '@/pages/ProjectRequirements/ImplementationTicketsPanel';

import '@/pages/ProjectRequirements/DetailsPage.scss';

export function DetailsPage() {
    const { projectId, requirementId } = useParams();
    const navigate = useNavigate();

    const requirementDetailsRoute =
        projectId === undefined || requirementId === undefined
            ? undefined
            : getProjectRequirementDetailsRoute(projectId, requirementId);

    const requirementsCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectRequirementsCollection(projectId)),
        [projectId],
    );

    const requirementQuery = useLiveQuery(
        (query) => {
            if (requirementsCollection === undefined || requirementId === undefined) {
                return undefined;
            }

            return query
                .from({ requirements: requirementsCollection })
                .where(({ requirements }) => eq(requirements.id, requirementId))
                .findOne();
        },
        [requirementsCollection, requirementId],
    );

    const requirement = requirementQuery.data;
    const reviewSummaryQuery = useQuery({
        queryKey: ['review-summary', projectId, requirementId],
        queryFn: () => {
            if (projectId === undefined || requirementId === undefined) {
                throw new Error('Review summary identifiers are missing.');
            }
            return getReviewSummary(projectId, requirementId);
        },
        enabled: projectId !== undefined && requirementId !== undefined,
    });

    useEffect(() => {
        if (projectId === undefined || requirement === undefined) {
            clearReviewActionRequirement();
            return;
        }
        setReviewActionRequirement({
            projectId,
            requirementId: requirement.id,
            visibleKey: requirement.visibleKey,
            status: requirement.status,
            implementationTicketCount: requirement.implementationTickets.length,
        });
    }, [projectId, requirement]);

    useEffect(() => {
        if (
            projectId !== undefined &&
            requirementId !== undefined &&
            requirement?.status === 'draft' &&
            reviewSummaryQuery.data?.state !== undefined &&
            reviewSummaryQuery.data.state !== 'not_started'
        ) {
            void navigate(getProjectRequirementReviewRoute(projectId, requirementId), { replace: true });
        }
    }, [navigate, projectId, requirement, requirementId, reviewSummaryQuery.data]);

    useEffect(() => {
        if (requirement === undefined || requirementDetailsRoute === undefined) {
            return;
        }

        openTab({ id: requirementDetailsRoute, label: requirement.visibleKey, closable: true });
    }, [requirement, requirementDetailsRoute]);

    if (projectId === undefined || requirementId === undefined) {
        return (
            <section className='project-requirements-details-page'>
                <InlineStatus kind='error'>Requirement route is incomplete.</InlineStatus>
            </section>
        );
    }

    return (
        <section
            className='project-requirements-details-page'
            aria-labelledby='project-requirements-details-page-title'
        >
            <LoadableContent
                loading={requirementQuery.isLoading}
                error={requirementQuery.isError}
                empty={requirement === undefined}
                loadingMessage='Loading requirement …'
                errorMessage='Requirement could not be loaded.'
                emptyMessage='Requirement could not be found in the project requirements list.'
            >
                <RequirementDetailsPanel
                    requirement={requirement}
                    title={requirement === undefined ? 'Requirement details' : requirement.visibleKey}
                    titleElement='h1'
                    titleId='project-requirements-details-page-title'
                />
                {requirement !== undefined && <ImplementationTicketsPanel requirement={requirement} />}
            </LoadableContent>
        </section>
    );
}
