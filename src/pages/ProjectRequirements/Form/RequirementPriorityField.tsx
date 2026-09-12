import {
    getRequirementFieldHint,
    optionalPriorityValues,
} from '@/pages/ProjectRequirements/Form/requirementFormPresentation';
import type {
    RequirementFormState,
    RequirementFormValues,
} from '@/pages/ProjectRequirements/Form/requirementFormTypes';

export type RequirementPriorityFieldProps = Readonly<{
    formState: RequirementFormState;
    formValues: RequirementFormValues;
    pending: boolean;
    onChange: (value: string) => void;
}>;

export function RequirementPriorityField({ formState, formValues, pending, onChange }: RequirementPriorityFieldProps) {
    return (
        <div className='project-requirements-form-page__field'>
            <label
                className='project-requirements-form-page__label'
                htmlFor='requirement-priority'>
                Priority
            </label>
            <select
                id='requirement-priority'
                name='priority'
                className='project-requirements-form-page__select'
                value={formValues.priority}
                disabled={pending}
                onChange={(event) => onChange(event.currentTarget.value)}>
                {optionalPriorityValues.map((priority) => (
                    <option
                        key={priority || 'none'}
                        value={priority}>
                        {priority === '' ? 'No priority' : priority.toUpperCase()}
                    </option>
                ))}
            </select>
            <p className='project-requirements-form-page__hint'>
                {getRequirementFieldHint('priority', formState.fieldErrors.priority)}
            </p>
        </div>
    );
}
