import type { Category } from '@/api/categoriesApi';

import { getCategoryLabel, getRequirementFieldHint } from '@/pages/ProjectRequirements/Form/requirementFormPresentation';
import type {
    RequirementFormState,
    RequirementFormValues,
} from '@/pages/ProjectRequirements/Form/requirementFormTypes';

export type RequirementCategoryFieldProps = Readonly<{
    categories: readonly Category[];
    formState: RequirementFormState;
    formValues: RequirementFormValues;
    pending: boolean;
    onChange: (value: string) => void;
}>;

export function RequirementCategoryField({
    categories,
    formState,
    formValues,
    pending,
    onChange,
}: RequirementCategoryFieldProps) {
    return (
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
                aria-describedby={formState.fieldErrors.categoryId === undefined ? undefined : 'requirement-category-error'}
                onChange={(event) => onChange(event.currentTarget.value)}
            >
                <option value=''>Select a category</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {getCategoryLabel(category)}
                    </option>
                ))}
            </select>
            {formState.fieldErrors.categoryId === undefined ? (
                <p className='project-requirements-form-page__hint'>{getRequirementFieldHint('categoryId', undefined)}</p>
            ) : (
                <p id='requirement-category-error' className='project-requirements-form-page__error'>
                    {formState.fieldErrors.categoryId}
                </p>
            )}
        </div>
    );
}
