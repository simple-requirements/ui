import type { ElementType } from 'react';
import { Link } from 'react-router';

import type { Requirement } from '@/api/requirementsApi';

import type { Metric } from '@/api/metricsApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { getProjectRequirementDetailsRoute } from '@/router/projectRoutes';
import { formatDateTime } from '@/utils/displayFormatters';

import '@/pages/ProjectMetrics/ProjectMetrics.scss';

export type MetricDetailsPanelProps = Readonly<{
    metric?: Metric;
    title: string;
    titleElement?: 'h1' | 'h2';
    titleId?: string;
    emptyMessage?: string;
    referencingRequirements?: readonly Requirement[];
}>;

export function MetricDetailsPanel({
    metric,
    title,
    titleElement = 'h2',
    titleId,
    emptyMessage = 'Select a metric to show its details.',
    referencingRequirements = [],
}: MetricDetailsPanelProps) {
    const TitleElement: ElementType = titleElement;

    return (
        <div className='metric-details-panel ui-panel ui-panel--padded ui-panel--full-height ui-panel--flex-column ui-panel--overflow-auto'>
            <header className='metric-details-panel__header'>
                <TitleElement id={titleId} className='metric-details-panel__title'>
                    {title}
                </TitleElement>
            </header>

            {metric === undefined ? (
                <InlineStatus kind='empty'>{emptyMessage}</InlineStatus>
            ) : (
                <dl className='metric-details-panel__details-list'>
                    <div className='metric-details-panel__details-row'>
                        <dt>Key</dt>
                        <dd>{metric.key}</dd>
                    </div>
                    <div className='metric-details-panel__details-row'>
                        <dt>Value</dt>
                        <dd>{metric.value}</dd>
                    </div>
                    <div className='metric-details-panel__details-row'>
                        <dt>Description</dt>
                        <dd>{metric.description === '' ? '—' : metric.description}</dd>
                    </div>
                    <div className='metric-details-panel__details-row'>
                        <dt>Status</dt>
                        <dd>{metric.active ? 'Active' : 'Deactivated'}</dd>
                    </div>
                    <div className='metric-details-panel__details-row'>
                        <dt>Created</dt>
                        <dd>{formatDateTime(metric.createdAt)}</dd>
                    </div>
                    <div className='metric-details-panel__details-row'>
                        <dt>Updated</dt>
                        <dd>{formatDateTime(metric.updatedAt)}</dd>
                    </div>
                    <div className='metric-details-panel__details-row'>
                        <dt>Usage count</dt>
                        <dd>{referencingRequirements.length}</dd>
                    </div>
                    <div className='metric-details-panel__details-row'>
                        <dt>Referencing requirements</dt>
                        <dd>
                            {referencingRequirements.length === 0 ? (
                                '—'
                            ) : (
                                <ul className='metric-details-panel__requirement-list'>
                                    {referencingRequirements.map((requirement) => (
                                        <li key={requirement.id}>
                                            <Link to={getProjectRequirementDetailsRoute(metric.projectId, requirement.id)}>
                                                {requirement.visibleKey}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </dd>
                    </div>
                </dl>
            )}
        </div>
    );
}
