import { eq, useLiveQuery } from '@tanstack/react-db';
import { Button } from 'primereact/button';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { cacheProjectMetric, getProjectMetricsCollection } from '@/api/collections/projectMetricsCollection';
import { getProjectRequirementsCollection } from '@/api/collections/projectRequirementsCollection';
import { deactivateProjectMetricRequest, getListProjectMetricsQueryKey } from '@/api/metricsApi';
import { queryClient } from '@/api/queryClient';
import { getListProjectRequirementsQueryKey } from '@/api/requirementsApi';
import { useProjectPermissions } from '@/auth/projectPermissions';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { showToastMessage } from '@/components/Feedback/toastEvents';
import { getProjectMetricDetailsRoute, getProjectMetricEditRoute } from '@/router/projectRoutes';
import { openTab } from '@/stores/tabBarStore';

import { MetricDeactivateDialog } from '@/pages/ProjectMetrics/MetricDeactivateDialog';
import { MetricDetailsPanel } from '@/pages/ProjectMetrics/MetricDetailsPanel';

import '@/pages/ProjectMetrics/ProjectMetrics.scss';

export function DetailsPage() {
    const { projectId, metricId } = useParams();
    const navigate = useNavigate();
    const permissions = useProjectPermissions(projectId);
    const [deactivateRequested, setDeactivateRequested] = useState(false);
    const [pending, setPending] = useState(false);
    const collection = useMemo(
        () => (projectId === undefined ? undefined : getProjectMetricsCollection(projectId)),
        [projectId],
    );
    const metricQuery = useLiveQuery(
        (query) => {
            if (collection === undefined || metricId === undefined) return undefined;
            return query
                .from({ metrics: collection })
                .where(({ metrics }) => eq(metrics.id, metricId))
                .findOne();
        },
        [collection, metricId],
    );
    const metric = metricQuery.data;
    const requirementsCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectRequirementsCollection(projectId)),
        [projectId],
    );
    const requirementsQuery = useLiveQuery(
        (query) =>
            requirementsCollection === undefined ? undefined : query.from({ requirements: requirementsCollection }),
        [requirementsCollection],
    );
    const referencingRequirements = useMemo(
        () =>
            metric === undefined ?
                []
            :   (requirementsQuery.data ?? []).filter(
                    (requirement) =>
                        requirement.metricReferences?.some((reference) => reference.metricId === metric.id) ?? false,
                ),
        [metric, requirementsQuery.data],
    );

    useEffect(() => {
        if (metric === undefined || projectId === undefined) return;
        const route = getProjectMetricDetailsRoute(projectId, metric.id);
        openTab({ id: route, label: `Metric ${metric.key}`, closable: true });
    }, [metric, projectId]);

    if (projectId === undefined || metricId === undefined) {
        return <InlineStatus kind='error'>Metric route is incomplete.</InlineStatus>;
    }

    async function deactivate(): Promise<void> {
        if (metric === undefined) return;
        setPending(true);
        try {
            const deactivatedMetric = await deactivateProjectMetricRequest(projectId, metric.id);
            cacheProjectMetric(projectId, deactivatedMetric);
            void queryClient.invalidateQueries({ queryKey: getListProjectMetricsQueryKey(projectId) });
            void queryClient.invalidateQueries({ queryKey: getListProjectRequirementsQueryKey(projectId) });
            showToastMessage({
                severity: 'success',
                summary: 'Metric deactivated',
                detail: `${metric.key} has been deactivated.`,
                life: 3000,
            });
            setDeactivateRequested(false);
        } catch {
            showToastMessage({
                severity: 'error',
                summary: 'Metric could not be deactivated',
                detail: `${metric.key} could not be deactivated.`,
                life: 5000,
            });
        } finally {
            setPending(false);
        }
    }

    return (
        <section
            className='project-metrics-details-page'
            aria-labelledby='project-metrics-details-page-title'>
            <MetricDeactivateDialog
                metric={deactivateRequested ? metric : undefined}
                pending={pending}
                onAbort={() => setDeactivateRequested(false)}
                onConfirm={() => void deactivate()}
            />
            <div className='project-metrics-details-page__actions'>
                {permissions.canManageRequirements && metric !== undefined && (
                    <>
                        <Button
                            type='button'
                            label='Edit'
                            outlined
                            onClick={() => void navigate(getProjectMetricEditRoute(projectId, metric.id))}
                            pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
                        />
                        <Button
                            type='button'
                            label='Deactivate'
                            outlined
                            disabled={!metric.active}
                            onClick={() => setDeactivateRequested(true)}
                            pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
                        />
                    </>
                )}
            </div>
            <LoadableContent
                loading={metricQuery.isLoading}
                error={metricQuery.isError}
                empty={metric === undefined}
                loadingMessage='Loading metric …'
                errorMessage='Metric could not be loaded.'
                emptyMessage='Metric could not be found in the project metrics list.'>
                <MetricDetailsPanel
                    metric={metric}
                    title={metric === undefined ? 'Metric details' : `Metric ${metric.key}`}
                    titleElement='h1'
                    titleId='project-metrics-details-page-title'
                    referencingRequirements={referencingRequirements}
                />
            </LoadableContent>
        </section>
    );
}
