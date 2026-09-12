import { Button } from 'primereact/button';

import type { RequirementFormMode } from '@/pages/ProjectRequirements/Form/requirementFormTypes';

export type RequirementFormActionsProps = Readonly<{
    mode: RequirementFormMode;
    pending: boolean;
    onAbort: () => void;
}>;

export function RequirementFormActions({ mode, pending, onAbort }: RequirementFormActionsProps) {
    return (
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
                onClick={onAbort}
                pt={{
                    root: {
                        className: 'project-requirements-form-page__secondary-button',
                    },
                }}
            />
        </div>
    );
}
