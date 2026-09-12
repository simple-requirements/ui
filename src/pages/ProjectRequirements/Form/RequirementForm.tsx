import type { Category } from '@/api/categoriesApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { useRef, useState } from 'react';

import { RequirementCategoryField } from '@/pages/ProjectRequirements/Form/RequirementCategoryField';
import { RequirementFormActions } from '@/pages/ProjectRequirements/Form/RequirementFormActions';
import { RequirementOwnerField } from '@/pages/ProjectRequirements/Form/RequirementOwnerField';
import { RequirementPriorityField } from '@/pages/ProjectRequirements/Form/RequirementPriorityField';
import { RequirementTextAreaField } from '@/pages/ProjectRequirements/Form/RequirementTextAreaField';
import type { RequirementFormMode } from '@/pages/ProjectRequirements/Form/requirementFormTypes';
import type { RequirementFormController } from '@/pages/ProjectRequirements/Form/useRequirementFormController';
import { RequirementLifecycleDialog } from '@/pages/ProjectRequirements/RequirementLifecycleDialog';

export type RequirementFormProps = Readonly<{
    mode: RequirementFormMode;
    categories: readonly Category[];
    controller: RequirementFormController;
}>;

/**
 * Renders the create or update requirement form and its update-reason confirmation dialog.
 * @param mode Requirement form mode.
 * @param categories Categories available for assignment.
 * @param controller Requirement form state and handlers.
 * @returns Requirement form.
 */
export function RequirementForm({ mode, categories, controller }: RequirementFormProps) {
    const { formRoute, formValues, formState, pending, updateFormValue, handleAbort, formAction } = controller;
    const formRef = useRef<HTMLFormElement>(null);
    const changeReasonInputRef = useRef<HTMLInputElement>(null);
    const confirmedUpdateRef = useRef(false);
    const [changeReasonDialogOpen, setChangeReasonDialogOpen] = useState(false);

    /** Opens the change-reason dialog before an update is submitted. */
    function requestUpdate(): void {
        setChangeReasonDialogOpen(true);
    }

    /**
     * Stores the confirmed reason and submits the update through the existing form action.
     * @param reason Confirmed non-empty revision reason.
     */
    function confirmUpdate(reason?: string): void {
        if (reason === undefined || changeReasonInputRef.current === null) {
            return;
        }

        changeReasonInputRef.current.value = reason;
        confirmedUpdateRef.current = true;
        setChangeReasonDialogOpen(false);
        formRef.current?.requestSubmit();
    }

    return (
        <>
            <form
                ref={formRef}
                id='requirement-form'
                name='requirement-form'
                className='project-requirements-form-page__form'
                action={formAction}
                data-route={formRoute}
                onSubmit={(event) => {
                    if (mode === 'update' && !confirmedUpdateRef.current) {
                        event.preventDefault();
                        requestUpdate();
                        return;
                    }
                    confirmedUpdateRef.current = false;
                }}>
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
                {mode === 'update' && (
                    <input
                        ref={changeReasonInputRef}
                        type='hidden'
                        name='changeReason'
                    />
                )}

                <RequirementFormActions
                    mode={mode}
                    pending={pending}
                    onAbort={handleAbort}
                    onUpdate={requestUpdate}
                />
            </form>

            {mode === 'update' && changeReasonDialogOpen && (
                <RequirementLifecycleDialog
                    visible
                    title='Change reason'
                    reasonRequired
                    reasonLabel='Change reason'
                    confirmLabel='Update'
                    pending={pending}
                    onAbort={() => setChangeReasonDialogOpen(false)}
                    onConfirm={confirmUpdate}
                />
            )}
        </>
    );
}
