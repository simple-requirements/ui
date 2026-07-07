import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

import type { Category } from '@/api/categoriesApi';
import { requirementPrioritySchema } from '@/api/requirementsApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';

import type {
    RequirementFormFieldName,
    RequirementFormMode,
} from '@/pages/ProjectRequirements/Form/requirementFormTypes';
import type { RequirementFormController } from '@/pages/ProjectRequirements/Form/useRequirementFormController';

export type RequirementFormProps = Readonly<{
    mode: RequirementFormMode;
    categories: readonly Category[];
    controller: RequirementFormController;
}>;

const optionalPriorityValues = ['', ...requirementPrioritySchema.options] as const;

function getCategoryLabel(category: Category): string {
    return `${category.key} — ${category.name} (${category.type})`;
}

function getFieldHint(fieldName: RequirementFormFieldName, errorMessage: string | undefined): string | undefined {
    if (errorMessage !== undefined) {
        return undefined;
    }

    if (fieldName === 'categoryId') {
        return 'Choose the category that defines the requirement key prefix.';
    }

    if (fieldName === 'priority') {
        return 'Choose an optional priority.';
    }

    if (fieldName === 'owner') {
        return 'Enter an optional owner name.';
    }

    return 'Optional requirement text.';
}

export function RequirementForm({ mode, categories, controller }: RequirementFormProps) {
    const { formRoute, formValues, formState, pending, updateFormValue, handleAbort, formAction } = controller;

    return (
        <form
            id='requirement-form'
            name='requirement-form'
            className='project-requirements-form-page__form'
            action={formAction}
            data-route={formRoute}
        >
            {formState.formError !== undefined && <InlineStatus kind='error'>{formState.formError}</InlineStatus>}

            <div className='project-requirements-form-page__field'>
                <label className='project-requirements-form-page__label' htmlFor='requirement-category'>
                    Category
                </label>
                <select
                    id='requirement-category'
                    name='categoryId'
                    className='project-requirements-form-page__select'
                    value={formValues.categoryId}
                    disabled={pending}
                    aria-invalid={formState.fieldErrors.categoryId === undefined ? undefined : true}
                    aria-describedby={
                        formState.fieldErrors.categoryId === undefined ? undefined : 'requirement-category-error'
                    }
                    onChange={(event) => updateFormValue('categoryId', event.currentTarget.value)}
                >
                    <option value=''>Select a category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {getCategoryLabel(category)}
                        </option>
                    ))}
                </select>
                {formState.fieldErrors.categoryId === undefined ? (
                    <p className='project-requirements-form-page__hint'>{getFieldHint('categoryId', undefined)}</p>
                ) : (
                    <p id='requirement-category-error' className='project-requirements-form-page__error'>
                        {formState.fieldErrors.categoryId}
                    </p>
                )}
            </div>

            <div className='project-requirements-form-page__field'>
                <label className='project-requirements-form-page__label' htmlFor='requirement-description'>
                    Description
                </label>
                <textarea
                    id='requirement-description'
                    name='description'
                    className='project-requirements-form-page__textarea'
                    value={formValues.description}
                    disabled={pending}
                    rows={5}
                    onChange={(event) => updateFormValue('description', event.currentTarget.value)}
                />
                <p className='project-requirements-form-page__hint'>
                    {getFieldHint('description', formState.fieldErrors.description)}
                </p>
            </div>

            <div className='project-requirements-form-page__field'>
                <label className='project-requirements-form-page__label' htmlFor='requirement-priority'>
                    Priority
                </label>
                <select
                    id='requirement-priority'
                    name='priority'
                    className='project-requirements-form-page__select'
                    value={formValues.priority}
                    disabled={pending}
                    onChange={(event) => updateFormValue('priority', event.currentTarget.value)}
                >
                    {optionalPriorityValues.map((priority) => (
                        <option key={priority || 'none'} value={priority}>
                            {priority === '' ? 'No priority' : priority.toUpperCase()}
                        </option>
                    ))}
                </select>
                <p className='project-requirements-form-page__hint'>
                    {getFieldHint('priority', formState.fieldErrors.priority)}
                </p>
            </div>

            <div className='project-requirements-form-page__field'>
                <label className='project-requirements-form-page__label' htmlFor='requirement-owner'>
                    Owner
                </label>
                <InputText
                    id='requirement-owner'
                    name='owner'
                    value={formValues.owner}
                    maxLength={120}
                    disabled={pending}
                    aria-invalid={formState.fieldErrors.owner === undefined ? undefined : true}
                    aria-describedby={formState.fieldErrors.owner === undefined ? undefined : 'requirement-owner-error'}
                    onChange={(event) => updateFormValue('owner', event.currentTarget.value)}
                    pt={{ root: { className: 'project-requirements-form-page__input' } }}
                />
                {formState.fieldErrors.owner === undefined ? (
                    <p className='project-requirements-form-page__hint'>{getFieldHint('owner', undefined)}</p>
                ) : (
                    <p id='requirement-owner-error' className='project-requirements-form-page__error'>
                        {formState.fieldErrors.owner}
                    </p>
                )}
            </div>

            <div className='project-requirements-form-page__field'>
                <label className='project-requirements-form-page__label' htmlFor='requirement-rationale'>
                    Rationale
                </label>
                <textarea
                    id='requirement-rationale'
                    name='rationale'
                    className='project-requirements-form-page__textarea'
                    value={formValues.rationale}
                    disabled={pending}
                    rows={3}
                    onChange={(event) => updateFormValue('rationale', event.currentTarget.value)}
                />
                <p className='project-requirements-form-page__hint'>
                    {getFieldHint('rationale', formState.fieldErrors.rationale)}
                </p>
            </div>

            <div className='project-requirements-form-page__field'>
                <label className='project-requirements-form-page__label' htmlFor='requirement-source'>
                    Source
                </label>
                <textarea
                    id='requirement-source'
                    name='source'
                    className='project-requirements-form-page__textarea'
                    value={formValues.source}
                    disabled={pending}
                    rows={3}
                    onChange={(event) => updateFormValue('source', event.currentTarget.value)}
                />
                <p className='project-requirements-form-page__hint'>
                    {getFieldHint('source', formState.fieldErrors.source)}
                </p>
            </div>

            <div className='project-requirements-form-page__actions'>
                <Button
                    type='submit'
                    label={mode === 'create' ? 'Create' : 'Update'}
                    disabled={pending}
                    pt={{
                        root: {
                            className: 'project-requirements-form-page__primary-button',
                        },
                    }}
                />
                <Button
                    type='button'
                    label='Abort'
                    outlined
                    disabled={pending}
                    onClick={handleAbort}
                    pt={{
                        root: {
                            className: 'project-requirements-form-page__secondary-button',
                        },
                    }}
                />
            </div>
        </form>
    );
}
