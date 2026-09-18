import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import type { ChangeEvent } from 'react';

import { categoryTypeSchema } from '@/api/categoriesApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';

import type { CategoryFormController } from '@/pages/ProjectCategories/Form/useCategoryFormController';
import type { CategoryFormFieldName, CategoryFormMode } from '@/pages/ProjectCategories/Form/categoryFormTypes';

export type CategoryFormProps = Readonly<{ mode: CategoryFormMode; controller: CategoryFormController }>;

const categoryTypes = categoryTypeSchema.options;

function getFieldHint(
    fieldName: CategoryFormFieldName,
    mode: CategoryFormMode,
    errorMessage: string | undefined,
): string | undefined {
    if (errorMessage !== undefined) {
        return undefined;
    }

    if (fieldName === 'name') {
        return 'Enter a unique category name.';
    }

    if (fieldName === 'key') {
        return mode === 'update' ?
                'The category key cannot be changed.'
            :   'Use 2 to 4 uppercase letters. The key must be unique within the project.';
    }

    return mode === 'update' ?
            'The category type cannot be changed.'
        :   'Choose whether this is a functional or non-functional category.';
}

export function CategoryForm({ mode, controller }: CategoryFormProps) {
    const { formRoute, formValues, formState, pending, updateFormValue, handleAbort, formAction } = controller;

    return (
        <form
            id='category-form'
            name='category-form'
            className='project-categories-form-page__form ui-form ui-form--medium'
            action={formAction}
            data-route={formRoute}>
            {formState.formError !== undefined && <InlineStatus kind='error'>{formState.formError}</InlineStatus>}

            <div className='project-categories-form-page__field ui-field'>
                <label
                    className='project-categories-form-page__label ui-label'
                    htmlFor='category-name'>
                    Name
                </label>
                <InputText
                    id='category-name'
                    name='name'
                    value={formValues.name}
                    maxLength={120}
                    disabled={pending}
                    aria-invalid={formState.fieldErrors.name === undefined ? undefined : true}
                    aria-describedby={formState.fieldErrors.name === undefined ? undefined : 'category-name-error'}
                    onChange={(event) => updateFormValue('name', event.currentTarget.value)}
                    pt={{
                        root: {
                            className:
                                'project-categories-form-page__input ui-control ui-control--line ui-control--narrow',
                        },
                    }}
                />
                {formState.fieldErrors.name === undefined ?
                    <p className='project-categories-form-page__hint ui-message'>
                        {getFieldHint('name', mode, undefined)}
                    </p>
                :   <p
                        id='category-name-error'
                        className='project-categories-form-page__error ui-message ui-message--error'>
                        {formState.fieldErrors.name}
                    </p>
                }
            </div>

            <div className='project-categories-form-page__field ui-field'>
                <label
                    className='project-categories-form-page__label ui-label'
                    htmlFor='category-key'>
                    Key
                </label>
                <InputText
                    id='category-key'
                    name='key'
                    value={formValues.key}
                    maxLength={4}
                    readOnly={mode === 'update'}
                    disabled={pending}
                    aria-invalid={formState.fieldErrors.key === undefined ? undefined : true}
                    aria-describedby={formState.fieldErrors.key === undefined ? undefined : 'category-key-error'}
                    onChange={(event) => updateFormValue('key', event.currentTarget.value)}
                    pt={{
                        root: {
                            className:
                                'project-categories-form-page__input ui-control ui-control--line ui-control--narrow',
                        },
                    }}
                />
                {formState.fieldErrors.key === undefined ?
                    <p className='project-categories-form-page__hint ui-message'>
                        {getFieldHint('key', mode, undefined)}
                    </p>
                :   <p
                        id='category-key-error'
                        className='project-categories-form-page__error ui-message ui-message--error'>
                        {formState.fieldErrors.key}
                    </p>
                }
            </div>

            <div className='project-categories-form-page__field ui-field'>
                <label
                    className='project-categories-form-page__label ui-label'
                    htmlFor='category-type'>
                    Type
                </label>
                <select
                    id='category-type'
                    name='type'
                    className='project-categories-form-page__select ui-control ui-control--line ui-control--narrow'
                    value={formValues.type}
                    disabled={pending || mode === 'update'}
                    aria-describedby={formState.fieldErrors.type === undefined ? undefined : 'category-type-error'}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        updateFormValue('type', event.currentTarget.value)
                    }>
                    {categoryTypes.map((categoryType) => (
                        <option
                            key={categoryType}
                            value={categoryType}>
                            {categoryType}
                        </option>
                    ))}
                </select>
                {formState.fieldErrors.type === undefined ?
                    <p className='project-categories-form-page__hint ui-message'>
                        {getFieldHint('type', mode, undefined)}
                    </p>
                :   <p
                        id='category-type-error'
                        className='project-categories-form-page__error ui-message ui-message--error'>
                        {formState.fieldErrors.type}
                    </p>
                }
                {mode === 'update' && (
                    <input
                        type='hidden'
                        name='type'
                        value={formValues.type}
                    />
                )}
            </div>

            <div className='project-categories-form-page__actions ui-form-actions'>
                <Button
                    type='submit'
                    label={mode === 'create' ? 'Create' : 'Update'}
                    disabled={pending}
                    pt={{ root: { className: 'ui-button ui-button--primary ui-button--form' } }}
                />
                <Button
                    type='button'
                    label='Abort'
                    outlined
                    disabled={pending}
                    onClick={handleAbort}
                    pt={{ root: { className: 'ui-button ui-button--outline ui-button--form' } }}
                />
            </div>
        </form>
    );
}
