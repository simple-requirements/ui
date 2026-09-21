import { InputText } from 'primereact/inputtext';

import { getRequirementFieldHint } from '@/pages/ProjectRequirements/Form/requirementFormPresentation';
import type {
    RequirementFormState,
    RequirementFormValues,
} from '@/pages/ProjectRequirements/Form/requirementFormTypes';

export type RequirementOwnerFieldProps = Readonly<{
    formState: RequirementFormState;
    formValues: RequirementFormValues;
    pending: boolean;
    onChange: (value: string) => void;
}>;

export function RequirementOwnerField({ formState, formValues, pending, onChange }: RequirementOwnerFieldProps) {
    return (
        <div className='project-requirements-form-page__field ui-field'>
            <label
                className='project-requirements-form-page__label ui-label'
                htmlFor='requirement-owner'>
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
                onChange={(event) => onChange(event.currentTarget.value)}
                pt={{ root: { className: 'project-requirements-form-page__input ui-control ui-control--line' } }}
            />
            {formState.fieldErrors.owner === undefined ?
                <p className='project-requirements-form-page__hint ui-message'>
                    {getRequirementFieldHint('owner', undefined)}
                </p>
            :   <p
                    id='requirement-owner-error'
                    className='project-requirements-form-page__error ui-message ui-message--error'>
                    {formState.fieldErrors.owner}
                </p>
            }
        </div>
    );
}
