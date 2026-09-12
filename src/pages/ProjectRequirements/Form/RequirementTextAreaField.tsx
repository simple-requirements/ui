import { getRequirementFieldHint } from '@/pages/ProjectRequirements/Form/requirementFormPresentation';
import type {
    RequirementFormFieldName,
    RequirementFormState,
    RequirementFormValues,
} from '@/pages/ProjectRequirements/Form/requirementFormTypes';

type RequirementTextAreaFieldName = Extract<RequirementFormFieldName, 'description' | 'rationale' | 'source'>;

export type RequirementTextAreaFieldProps = Readonly<{
    fieldName: RequirementTextAreaFieldName;
    label: string;
    rows: number;
    formState: RequirementFormState;
    formValues: RequirementFormValues;
    pending: boolean;
    onChange: (fieldName: RequirementTextAreaFieldName, value: string) => void;
}>;

const textAreaIds: Record<RequirementTextAreaFieldName, string> = {
    description: 'requirement-description',
    rationale: 'requirement-rationale',
    source: 'requirement-source',
};

export function RequirementTextAreaField({
    fieldName,
    label,
    rows,
    formState,
    formValues,
    pending,
    onChange,
}: RequirementTextAreaFieldProps) {
    const fieldId = textAreaIds[fieldName];

    return (
        <div className='project-requirements-form-page__field'>
            <label
                className='project-requirements-form-page__label'
                htmlFor={fieldId}>
                {label}
            </label>
            <textarea
                id={fieldId}
                name={fieldName}
                className='project-requirements-form-page__textarea'
                value={formValues[fieldName]}
                disabled={pending}
                rows={rows}
                onChange={(event) => onChange(fieldName, event.currentTarget.value)}
            />
            <p className='project-requirements-form-page__hint'>
                {getRequirementFieldHint(fieldName, formState.fieldErrors[fieldName])}
            </p>
        </div>
    );
}
