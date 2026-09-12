import type { Category } from '@/api/categoriesApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';

import { RequirementCategoryField } from '@/pages/ProjectRequirements/Form/RequirementCategoryField';
import { RequirementFormActions } from '@/pages/ProjectRequirements/Form/RequirementFormActions';
import { RequirementOwnerField } from '@/pages/ProjectRequirements/Form/RequirementOwnerField';
import { RequirementPriorityField } from '@/pages/ProjectRequirements/Form/RequirementPriorityField';
import { RequirementTextAreaField } from '@/pages/ProjectRequirements/Form/RequirementTextAreaField';
import type { RequirementFormMode } from '@/pages/ProjectRequirements/Form/requirementFormTypes';
import type { RequirementFormController } from '@/pages/ProjectRequirements/Form/useRequirementFormController';

export type RequirementFormProps = Readonly<{
    mode: RequirementFormMode;
    categories: readonly Category[];
    controller: RequirementFormController;
}>;

export function RequirementForm({ mode, categories, controller }: RequirementFormProps) {
    const { formRoute, formValues, formState, pending, updateFormValue, handleAbort, formAction } = controller;

    return (
        <form
            id='requirement-form'
            name='requirement-form'
            className='project-requirements-form-page__form'
            action={formAction}
            data-route={formRoute}>
            {formState.formError !== undefined && <InlineStatus kind='error'>{formState.formError}</InlineStatus>}

            <RequirementCategoryField
                categories={categories}
                formState={formState}
                formValues={formValues}
                pending={pending}
                onChange={(value) => updateFormValue('categoryId', value)}
            />
            <RequirementTextAreaField
                fieldName='description'
                label='Description'
                rows={5}
                formState={formState}
                formValues={formValues}
                pending={pending}
                onChange={updateFormValue}
            />
            <RequirementPriorityField
                formState={formState}
                formValues={formValues}
                pending={pending}
                onChange={(value) => updateFormValue('priority', value)}
            />
            <RequirementOwnerField
                formState={formState}
                formValues={formValues}
                pending={pending}
                onChange={(value) => updateFormValue('owner', value)}
            />
            <RequirementTextAreaField
                fieldName='rationale'
                label='Rationale'
                rows={3}
                formState={formState}
                formValues={formValues}
                pending={pending}
                onChange={updateFormValue}
            />
            <RequirementTextAreaField
                fieldName='source'
                label='Source'
                rows={3}
                formState={formState}
                formValues={formValues}
                pending={pending}
                onChange={updateFormValue}
            />

            <RequirementFormActions
                mode={mode}
                pending={pending}
                onAbort={handleAbort}
            />
        </form>
    );
}
