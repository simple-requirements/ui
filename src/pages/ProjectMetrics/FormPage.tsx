import { eq, useLiveQuery } from '@tanstack/react-db';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';

import { cacheProjectMetric, getProjectMetricsCollection } from '@/api/collections/projectMetricsCollection';
import {
    createMetricRequestSchema,
    createProjectMetricRequest,
    getListProjectMetricsQueryKey,
    updateMetricRequestSchema,
    updateProjectMetricRequest,
} from '@/api/metricsApi';
import { queryClient } from '@/api/queryClient';
import { getListProjectRequirementsQueryKey } from '@/api/requirementsApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { showToastMessage } from '@/components/Feedback/toastEvents';
import { getProjectMetricDetailsRoute, getProjectMetricsRoute } from '@/router/projectRoutes';
import { openTab } from '@/stores/tabBarStore';

import '@/pages/ProjectMetrics/ProjectMetrics.scss';

export function FormPage() {
    const { projectId, metricId } = useParams();
    const navigate = useNavigate();
    const mode = metricId === undefined ? 'create' : 'update';
    const collection = useMemo(
        () => (projectId === undefined ? undefined : getProjectMetricsCollection(projectId)),
        [projectId],
    );
    const metricQuery = useLiveQuery(
        (query) => {
            if (collection === undefined || metricId === undefined) return undefined;
            return query.from({ metrics: collection }).where(({ metrics }) => eq(metrics.id, metricId)).findOne();
        },
        [collection, metricId],
    );
    const metric = metricQuery.data;
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');
    const [valueError, setValueError] = useState<string>();
    const [formError, setFormError] = useState<string>();
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (mode === 'update' && metric !== undefined) {
            setValue(metric.value);
            setDescription(metric.description);
        }
    }, [metric, mode]);

    if (projectId === undefined) {
        return <InlineStatus kind='error'>Project route is missing a project id.</InlineStatus>;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        setValueError(undefined);
        setFormError(undefined);
        const parseResult = (mode === 'create' ? createMetricRequestSchema : updateMetricRequestSchema).safeParse({
            value,
            description,
        });
        if (!parseResult.success) {
            setValueError(parseResult.error.issues.find((issue) => issue.path[0] === 'value')?.message);
            return;
        }

        setPending(true);
        try {
            const saved =
                mode === 'create'
                    ? await createProjectMetricRequest(projectId, parseResult.data)
                    : metricId === undefined
                        ? undefined
                        : await updateProjectMetricRequest(projectId, metricId, parseResult.data);
            if (saved === undefined) {
                setFormError('Metric route is incomplete.');
                return;
            }
            cacheProjectMetric(projectId, saved);
            void queryClient.invalidateQueries({ queryKey: getListProjectMetricsQueryKey(projectId) });
            void queryClient.invalidateQueries({ queryKey: getListProjectRequirementsQueryKey(projectId) });
            const detailsRoute = getProjectMetricDetailsRoute(projectId, saved.id);
            showToastMessage({
                severity: 'success',
                summary: mode === 'create' ? 'Metric created' : 'Metric updated',
                detail: `${saved.key} has been ${mode === 'create' ? 'created' : 'updated'}.`,
                life: 3000,
            });
            openTab({ id: detailsRoute, label: `Metric ${saved.key}`, closable: true });
            void navigate(detailsRoute);
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Metric could not be saved.');
        } finally {
            setPending(false);
        }
    }

    const updateMetricMissing = mode === 'update' && !metricQuery.isLoading && metric === undefined;

    return (
        <section className='project-metrics-form-page' aria-labelledby='project-metrics-form-page-title'>
            <div className='project-metrics-form-page__panel ui-panel ui-panel--full-height ui-panel--flex-column ui-panel--overflow-auto'>
                <header className='project-metrics-form-page__header ui-panel__header'>
                    <h1 id='project-metrics-form-page-title' className='ui-panel__title'>
                        {mode === 'create' ? 'Create metric' : 'Update metric'}
                    </h1>
                </header>
                <LoadableContent
                    loading={mode === 'update' && metricQuery.isLoading}
                    error={mode === 'update' && metricQuery.isError}
                    empty={updateMetricMissing}
                    loadingMessage='Loading metric …'
                    errorMessage='Metric could not be loaded.'
                    emptyMessage='Metric could not be found in the project metrics list.'>
                    <form className='project-metrics-form-page__form ui-form ui-form--medium' onSubmit={(event) => void handleSubmit(event)}>
                        {formError !== undefined && <InlineStatus kind='error'>{formError}</InlineStatus>}
                        {mode === 'update' && metric !== undefined && (
                            <div className='ui-field'>
                                <label className='ui-label' htmlFor='metric-key'>Key</label>
                                <InputText
                                    id='metric-key'
                                    value={metric.key}
                                    readOnly
                                    disabled
                                    aria-describedby='metric-key-hint'
                                    pt={{ root: { className: 'project-metrics-form-page__input ui-control ui-control--line ui-control--narrow' } }}
                                />
                                <p id='metric-key-hint' className='ui-message'>Metric keys are generated by the backend and cannot be changed.</p>
                            </div>
                        )}
                        <div className='ui-field'>
                            <label className='ui-label' htmlFor='metric-value'>Value</label>
                            <InputText
                                id='metric-value'
                                name='value'
                                value={value}
                                disabled={pending}
                                aria-invalid={valueError === undefined ? undefined : true}
                                aria-describedby={valueError === undefined ? undefined : 'metric-value-error'}
                                onChange={(event) => setValue(event.currentTarget.value)}
                                pt={{ root: { className: 'project-metrics-form-page__input ui-control ui-control--line ui-control--narrow' } }}
                            />
                            {valueError !== undefined && <p id='metric-value-error' className='ui-message ui-message--error'>{valueError}</p>}
                        </div>
                        <div className='ui-field'>
                            <label className='ui-label' htmlFor='metric-description'>Description</label>
                            <InputTextarea
                                id='metric-description'
                                name='description'
                                value={description}
                                rows={5}
                                autoResize
                                disabled={pending}
                                onChange={(event) => setDescription(event.currentTarget.value)}
                                pt={{ root: { className: 'project-metrics-form-page__textarea ui-control ui-textarea' } }}
                            />
                        </div>
                        <div className='project-metrics-form-page__actions ui-form-actions'>
                            <Button
                                type='submit'
                                label='Save'
                                loading={pending}
                                disabled={pending}
                                pt={{ root: { className: 'ui-button ui-button--primary ui-button--form' } }}
                            />
                            <Button
                                type='button'
                                label='Abort'
                                outlined
                                disabled={pending}
                                onClick={() => void navigate(metricId === undefined ? getProjectMetricsRoute(projectId) : getProjectMetricDetailsRoute(projectId, metricId))}
                                pt={{ root: { className: 'ui-button ui-button--outline ui-button--form' } }}
                            />
                        </div>
                    </form>
                </LoadableContent>
            </div>
        </section>
    );
}
