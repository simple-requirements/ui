import { useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useProjectMetricsQuery } from '@/features/metrics/api/metricQueries';
import { renderMetricVisualText } from '@/features/requirements/metrics/metricAuthoring';
import type { Category, ProjectSummary, RequirementView } from '@/types/domain';
import {
    categoryOptionLabel,
    priorityOptions,
    type RequirementFormValues,
} from '@/features/requirements/requirementForms';

type RequirementFormProps = Readonly<{
    mode: 'create' | 'edit';
    project: ProjectSummary | null;
    categories: readonly Category[];
    initialRequirement?: RequirementView | null;
    error: string | null;
    pending: boolean;
    onSubmit: (values: RequirementFormValues) => void;
    onCancel: (dirty: boolean) => void;
}>;

const emptyValues: RequirementFormValues = {
    categoryId: '',
    description: '',
    priority: 'P1',
    owner: '',
    rationale: '',
    source: '',
};

/** Collects requirement fields while keeping project, type, key, and status immutable UI context only. */
export function RequirementForm({
    mode,
    project,
    categories,
    initialRequirement,
    error,
    pending,
    onSubmit,
    onCancel,
}: RequirementFormProps) {
    const initialValues = useMemo<RequirementFormValues>(() => {
        if (!initialRequirement) return { ...emptyValues, categoryId: categories[0]?.id ?? '' };
        return {
            categoryId: initialRequirement.categoryId,
            description: initialRequirement.description,
            priority: initialRequirement.priority,
            owner: initialRequirement.owner ?? '',
            rationale: initialRequirement.rationale ?? '',
            source: initialRequirement.source ?? '',
        };
    }, [categories, initialRequirement]);
    const [values, setValues] = useState(initialValues);
    const [descriptionMode, setDescriptionMode] = useState<'code' | 'visual'>('code');
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const selectedCategory = categories.find((category) => category.id === values.categoryId);
    const dirty = JSON.stringify(values) !== JSON.stringify(initialValues);
    const categoryOptions = categories.map((category) => ({
        label: categoryOptionLabel(category),
        value: category.id,
    }));
    const metricsQuery = useProjectMetricsQuery(project?.id ?? initialRequirement?.projectId ?? null);
    const metricPreview = renderMetricVisualText({
        text: values.description,
        metrics: metricsQuery.data ?? [],
        references: initialRequirement?.metricReferences ?? [],
    });

    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!values.description.trim()) {
            setDescriptionMode('code');
            queueMicrotask(() => descriptionRef.current?.focus());
            return;
        }
        onSubmit(values);
    };

    return (
        <form
            className='form requirement-form'
            onSubmit={handleSubmit}
            aria-busy={pending}>
            <h2>{mode === 'create' ? 'New requirement' : `Edit ${initialRequirement?.visibleKey ?? 'requirement'}`}</h2>
            {error ?
                <div
                    className='form__error'
                    role='alert'>
                    {error}
                </div>
            :   null}
            <section
                className='form__context'
                aria-label='Immutable requirement context'>
                <p>
                    <strong>Project:</strong> {project?.name ?? 'No active project'}
                </p>
                {mode === 'edit' && initialRequirement ?
                    <>
                        <p>
                            <strong>Visible key:</strong> {initialRequirement.visibleKey}
                        </p>
                        <p>
                            <strong>Category:</strong> {initialRequirement.categoryName} (
                            {initialRequirement.categoryKey})
                        </p>
                        <p>
                            <strong>Type:</strong> {initialRequirement.type}
                        </p>
                        <p>
                            <strong>Status:</strong> {initialRequirement.status}
                        </p>
                    </>
                :   null}
            </section>
            {mode === 'create' ?
                <div className='form__field'>
                    <label htmlFor='requirement-category'>
                        Category<span aria-hidden='true'> *</span>
                    </label>
                    <Dropdown
                        inputId='requirement-category'
                        value={values.categoryId}
                        options={categoryOptions}
                        onChange={(event) =>
                            setValues((current) => ({ ...current, categoryId: event.value as string }))
                        }
                        required
                        appendTo={document.body}
                        data-testid='Category-Dropdown'
                    />
                </div>
            :   null}
            {mode === 'create' ?
                <p
                    className='form__derived-value'
                    aria-live='polite'>
                    <strong>Derived type:</strong> {selectedCategory?.type ?? 'Select a category'}
                </p>
            :   null}
            <div className='form__field requirement-form__description-field'>
                <label htmlFor='requirement-description'>
                    Description<span aria-hidden='true'> *</span>
                </label>
                <div
                    className='requirement-form__description-tabs'
                    role='tablist'
                    aria-label='Description editor mode'>
                    <Button
                        type='button'
                        label='Code'
                        text={descriptionMode !== 'code'}
                        outlined={descriptionMode !== 'code'}
                        aria-pressed={descriptionMode === 'code'}
                        onClick={() => setDescriptionMode('code')}
                    />
                    <Button
                        type='button'
                        label='Visual'
                        text={descriptionMode !== 'visual'}
                        outlined={descriptionMode !== 'visual'}
                        aria-pressed={descriptionMode === 'visual'}
                        onClick={() => setDescriptionMode('visual')}
                    />
                </div>
                {descriptionMode === 'code' ?
                    <InputTextarea
                        id='requirement-description'
                        ref={descriptionRef}
                        value={values.description}
                        onChange={(event) =>
                            setValues((current) => ({ ...current, description: event.currentTarget.value }))
                        }
                        required
                        autoResize
                        rows={5}
                        aria-describedby='requirement-description-help'
                    />
                :   <output
                        id='requirement-description'
                        className='requirement-form__visual-preview'
                        aria-live='polite'>
                        {metricPreview.renderedText || 'Nothing to preview.'}
                    </output>
                }
                <p
                    id='requirement-description-help'
                    className='form__hint'>
                    Use <code>[~MET-0001]</code> to reference an existing metric. Code mode also accepts frontend-only
                    metric definitions such as <code>[~MET-0001 := 2000 ms]</code>; they are saved as canonical{' '}
                    <code>[~MET-0001]</code> references after explicit metric creation.
                </p>
                {metricPreview.definitions.length ?
                    <p
                        className='form__hint'
                        role='status'>
                        {metricPreview.definitions.length} inline metric definition
                        {metricPreview.definitions.length === 1 ? '' : 's'} will be created or reused before saving.
                    </p>
                :   null}
                {metricPreview.parseErrors.length ?
                    <ul
                        className='form__error-list'
                        role='alert'>
                        {metricPreview.parseErrors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                :   null}
            </div>
            <div className='form__field'>
                <label htmlFor='requirement-priority'>
                    Priority<span aria-hidden='true'> *</span>
                </label>
                <Dropdown
                    inputId='requirement-priority'
                    value={values.priority}
                    options={[...priorityOptions]}
                    onChange={(event) => setValues((current) => ({ ...current, priority: event.value as string }))}
                    required
                    appendTo={document.body}
                />
            </div>
            <div className='form__field'>
                <label htmlFor='requirement-owner'>Owner</label>
                <InputText
                    id='requirement-owner'
                    value={values.owner}
                    onChange={(event) => setValues((current) => ({ ...current, owner: event.currentTarget.value }))}
                />
            </div>
            <div className='form__field'>
                <label htmlFor='requirement-rationale'>Rationale</label>
                <InputText
                    id='requirement-rationale'
                    value={values.rationale}
                    onChange={(event) => setValues((current) => ({ ...current, rationale: event.currentTarget.value }))}
                />
            </div>
            <div className='form__field'>
                <label htmlFor='requirement-source'>Source</label>
                <InputText
                    id='requirement-source'
                    value={values.source}
                    onChange={(event) => setValues((current) => ({ ...current, source: event.currentTarget.value }))}
                />
            </div>
            <div className='form__actions'>
                <Button
                    type='submit'
                    label={mode === 'create' ? 'Create requirement' : 'Save changes'}
                    disabled={pending || !project || (mode === 'create' && !values.categoryId)}
                    loading={pending}
                />
                <Button
                    type='button'
                    label='Cancel'
                    outlined
                    onClick={() => onCancel(dirty)}
                    disabled={pending}
                />
            </div>
        </form>
    );
}
