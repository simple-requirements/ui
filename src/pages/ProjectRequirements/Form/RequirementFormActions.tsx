import { Button } from 'primereact/button';

import type { RequirementFormMode } from '@/pages/ProjectRequirements/Form/requirementFormTypes';

export type RequirementFormActionsProps = Readonly<{
    mode: RequirementFormMode;
    pending: boolean;
    onAbort: () => void;
    onUpdate: () => void;
}>;

/**
 * Renders create/update and abort actions for the requirement form.
 * @param props Form mode, pending state and action callbacks.
 * @returns Requirement form action buttons.
 */
export function RequirementFormActions({ mode, pending, onAbort, onUpdate }: RequirementFormActionsProps) {
    return (
        <div className='project-requirements-form-page__actions'>
            <Button
                type={mode === 'create' ? 'submit' : 'button'}
                label={mode === 'create' ? 'Create' : 'Update'}
                disabled={pending}
                onClick={mode === 'update' ? onUpdate : undefined}
                pt={{ root: { className: 'project-requirements-form-page__primary-button' } }}
            />
            <Button
                type='button'
                label='Abort'
                outlined
                disabled={pending}
                onClick={onAbort}
                pt={{ root: { className: 'project-requirements-form-page__secondary-button' } }}
            />
        </div>
    );
}
