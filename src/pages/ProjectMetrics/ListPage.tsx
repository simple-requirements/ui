import { useLiveQuery } from '@tanstack/react-db';
import { Button } from 'primereact/button';
import { Column, type ColumnPassThroughOptions } from 'primereact/column';
import { DataTable, type DataTableRowClickEvent, type DataTableSelectionSingleChangeEvent } from 'primereact/datatable';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { cacheProjectMetric, getProjectMetricsCollection } from '@/api/collections/projectMetricsCollection';
import { deactivateProjectMetricRequest, getListProjectMetricsQueryKey, type Metric } from '@/api/metricsApi';
import { queryClient } from '@/api/queryClient';
import { useProjectPermissions } from '@/auth/projectPermissions';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { showToastMessage } from '@/components/Feedback/toastEvents';
import {
    getProjectMetricCreateRoute,
    getProjectMetricDetailsRoute,
    getProjectMetricEditRoute,
} from '@/router/projectRoutes';
import { openTab } from '@/stores/tabBarStore';

import { MetricDeactivateDialog } from '@/pages/ProjectMetrics/MetricDeactivateDialog';
import { MetricDetailsPanel } from '@/pages/ProjectMetrics/MetricDetailsPanel';

import '@/pages/ProjectMetrics/ProjectMetrics.scss';

function isMetric(value: unknown): value is Metric {
    return typeof value === 'object' && value !== null && 'id' in value && 'key' in value;
}

function getMetricColumnPassThrough(columnClassName?: string): ColumnPassThroughOptions {
    const cellClassNames = [columnClassName];

    return {
        headerCell: {
            className: ['project-metrics-list-page__table-header-cell', ...cellClassNames]
                .filter((className) => className !== undefined)
                .join(' '),
        },
        bodyCell: {
            className: ['project-metrics-list-page__table-body-cell', ...cellClassNames]
                .filter((className) => className !== undefined)
                .join(' '),
        },
    };
}

function getMetricRowClassName(metric: Metric, selectedMetricId: string | undefined): string {
    return metric.id === selectedMetricId ?
            'project-metrics-list-page__table-row project-metrics-list-page__table-row--selected'
        :   'project-metrics-list-page__table-row';
}

export function ListPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const permissions = useProjectPermissions(projectId);
    const [selectedMetricId, setSelectedMetricId] = useState<string>();
    const [deactivateCandidate, setDeactivateCandidate] = useState<Metric>();
    const [deactivatePending, setDeactivatePending] = useState(false);
    const collection = useMemo(
        () => (projectId === undefined ? undefined : getProjectMetricsCollection(projectId)),
        [projectId],
    );
    const metricsQuery = useLiveQuery(
        (query) => (collection === undefined ? undefined : query.from({ metrics: collection })),
        [collection],
    );
    const metrics = useMemo(
        () => [...(metricsQuery.data ?? [])].sort((a, b) => a.key.localeCompare(b.key)),
        [metricsQuery.data],
    );
    const selectedMetric = metrics.find((metric) => metric.id === selectedMetricId) ?? metrics.at(0);

    useEffect(() => {
        if (metrics.length === 0) {
            setSelectedMetricId(undefined);
            return;
        }
        setSelectedMetricId((current) =>
            metrics.some((metric) => metric.id === current) ? current : metrics.at(0)?.id,
        );
    }, [metrics]);

    if (projectId === undefined) {
        return <InlineStatus kind='error'>Project route is missing a project id.</InlineStatus>;
    }

    function openMetric(metric: Metric): void {
        const route = getProjectMetricDetailsRoute(projectId, metric.id);
        openTab({ id: route, label: `Metric ${metric.key}`, closable: true });
        void navigate(route);
    }

    async function confirmDeactivate(): Promise<void> {
        if (deactivateCandidate === undefined) return;
        setDeactivatePending(true);
        try {
            const deactivatedMetric = await deactivateProjectMetricRequest(projectId, deactivateCandidate.id);
            cacheProjectMetric(projectId, deactivatedMetric);
            void queryClient.invalidateQueries({ queryKey: getListProjectMetricsQueryKey(projectId) });
            showToastMessage({
                severity: 'success',
                summary: 'Metric deactivated',
                detail: `${deactivateCandidate.key} has been deactivated.`,
                life: 3000,
            });
            setDeactivateCandidate(undefined);
        } catch {
            showToastMessage({
                severity: 'error',
                summary: 'Metric could not be deactivated',
                detail: `${deactivateCandidate.key} could not be deactivated.`,
                life: 5000,
            });
        } finally {
            setDeactivatePending(false);
        }
    }

    return (
        <section
            className='project-metrics-list-page'
            aria-labelledby='project-metrics-list-page-title'>
            <MetricDeactivateDialog
                metric={deactivateCandidate}
                pending={deactivatePending}
                onAbort={() => setDeactivateCandidate(undefined)}
                onConfirm={() => void confirmDeactivate()}
            />
            <Splitter
                layout='vertical'
                pt={{ root: { className: 'project-metrics-list-page__splitter' } }}>
                <SplitterPanel
                    size={67}
                    minSize={25}
                    pt={{ root: { className: 'project-metrics-list-page__splitter-panel' } }}>
                    <div className='project-metrics-list-page__list-panel ui-panel ui-panel--full-height ui-panel--flex-column ui-panel--overflow-hidden'>
                        <header className='project-metrics-list-page__header ui-panel__header'>
                            <h1
                                id='project-metrics-list-page-title'
                                className='project-metrics-list-page__title ui-panel__title'>
                                Metrics
                            </h1>
                            {permissions.canManageRequirements && (
                                <div className='project-metrics-list-page__actions'>
                                    <Button
                                        type='button'
                                        label='New metric'
                                        icon='pi pi-plus'
                                        onClick={() => void navigate(getProjectMetricCreateRoute(projectId))}
                                        pt={{
                                            root: {
                                                className:
                                                    'ui-button ui-button--primary ui-button--action ui-button--with-icon',
                                            },
                                        }}
                                    />
                                    <Button
                                        type='button'
                                        label='Edit'
                                        outlined
                                        disabled={selectedMetric === undefined}
                                        onClick={() => {
                                            if (selectedMetric !== undefined) {
                                                void navigate(getProjectMetricEditRoute(projectId, selectedMetric.id));
                                            }
                                        }}
                                        pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
                                    />
                                    <Button
                                        type='button'
                                        label='Deactivate'
                                        outlined
                                        disabled={!selectedMetric?.active}
                                        onClick={() => setDeactivateCandidate(selectedMetric)}
                                        pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
                                    />
                                </div>
                            )}
                        </header>
                        <LoadableContent
                            loading={metricsQuery.isLoading}
                            error={metricsQuery.isError}
                            empty={metrics.length === 0}
                            loadingMessage='Loading metrics …'
                            errorMessage='Metrics could not be loaded.'
                            emptyMessage='No metrics available.'>
                            <DataTable
                                value={metrics}
                                dataKey='id'
                                selectionMode='single'
                                metaKeySelection={false}
                                selection={selectedMetric ?? null}
                                onSelectionChange={(event: DataTableSelectionSingleChangeEvent<Metric[]>) =>
                                    setSelectedMetricId(isMetric(event.value) ? event.value.id : undefined)
                                }
                                onRowDoubleClick={(event: DataTableRowClickEvent) =>
                                    isMetric(event.data) && openMetric(event.data)
                                }
                                rowClassName={(metric: Metric) => getMetricRowClassName(metric, selectedMetricId)}
                                scrollable
                                scrollHeight='flex'
                                pt={{
                                    root: { className: 'project-metrics-list-page__data-table' },
                                    wrapper: { className: 'project-metrics-list-page__data-table-wrapper' },
                                    table: { 'className': 'project-metrics-list-page__table', 'aria-label': 'Metrics' },
                                }}>
                                <Column
                                    field='key'
                                    header='Key'
                                    pt={getMetricColumnPassThrough('project-metrics-list-page__key-column')}
                                />
                                <Column
                                    field='value'
                                    header='Value'
                                    pt={getMetricColumnPassThrough('project-metrics-list-page__value-column')}
                                />
                                <Column
                                    field='description'
                                    header='Description'
                                    pt={getMetricColumnPassThrough()}
                                />
                                <Column
                                    header='Status'
                                    body={(metric: Metric) => (metric.active ? 'Active' : 'Deactivated')}
                                    pt={getMetricColumnPassThrough('project-metrics-list-page__status-column')}
                                />
                            </DataTable>
                        </LoadableContent>
                    </div>
                </SplitterPanel>
                <SplitterPanel
                    size={33}
                    minSize={20}
                    pt={{ root: { className: 'project-metrics-list-page__splitter-panel' } }}>
                    <MetricDetailsPanel
                        metric={selectedMetric}
                        title='Metric details'
                    />
                </SplitterPanel>
            </Splitter>
        </section>
    );
}
