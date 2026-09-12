import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useActionState, useId } from 'react';
import { useFormStatus } from 'react-dom';

import {
    getProjectDialogErrorMessage,
    getProjectName,
    projectDialogSchema,
    type ProjectDialogSubmitData,
} from '@/components/RootLayout/Sidebar/projectDialogValidation';

export type ProjectDialogMode = 'create' | 'rename';
type FormState = Readonly<{ validationError?: string; submissionError?: string }>;
type Props = Readonly<{
    mode: ProjectDialogMode;
    initialName: string;
    pending: boolean;
    errorMessage?: string;
    onCancel: () => void;
    onSubmit: (data: ProjectDialogSubmitData) => void | Promise<void>;
}>;

function SubmitButton({ mode, externalPending }: Readonly<{ mode: ProjectDialogMode; externalPending: boolean }>) {
    const { pending } = useFormStatus();
    const isPending = pending || externalPending;
    const label =
        isPending ?
            mode === 'create' ?
                'Creating …'
            :   'Renaming …'
        : mode === 'create' ? 'Create'
        : 'Rename';
    return (
        <Button
            type='submit'
            label={label}
            disabled={isPending}
            pt={{ root: { className: 'project-dialog__button project-dialog__button--submit' } }}
        />
    );
}

export function ProjectDialogForm({ mode, initialName, pending, errorMessage, onCancel, onSubmit }: Props) {
    const inputId = useId();
    const errorId = useId();
    const [formState, formAction] = useActionState<FormState, FormData>(async (_state, formData) => {
        const result = projectDialogSchema.safeParse({ name: getProjectName(formData) });
        if (!result.success) return { validationError: result.error.issues[0]?.message ?? 'Project name is invalid.' };
        try {
            await onSubmit(result.data);
            return {};
        } catch (error) {
            return { submissionError: getProjectDialogErrorMessage(error) };
        }
    }, {});
    const currentError = formState.validationError ?? formState.submissionError ?? errorMessage;
    const invalid = currentError !== undefined;

    return (
        <form
            className='project-dialog__form'
            noValidate
            action={formAction}>
            <div className='project-dialog__field'>
                <label
                    className='project-dialog__label'
                    htmlFor={inputId}>
                    Project name
                </label>
                <InputText
                    id={inputId}
                    name='name'
                    defaultValue={initialName}
                    autoFocus
                    disabled={pending}
                    aria-invalid={invalid}
                    aria-describedby={invalid ? errorId : undefined}
                    pt={{
                        root: {
                            className:
                                invalid ?
                                    'project-dialog__input project-dialog__input--invalid'
                                :   'project-dialog__input',
                        },
                    }}
                />
                {currentError !== undefined && (
                    <p
                        id={errorId}
                        className='project-dialog__message project-dialog__message--error'>
                        {currentError}
                    </p>
                )}
            </div>
            <div className='project-dialog__actions'>
                <Button
                    outlined
                    type='button'
                    label='Cancel'
                    disabled={pending}
                    onClick={onCancel}
                    pt={{ root: { className: 'project-dialog__button project-dialog__button--cancel' } }}
                />
                <SubmitButton
                    mode={mode}
                    externalPending={pending}
                />
            </div>
        </form>
    );
}
