import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useActionState, useId } from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';

import '@/components/RootLayout/Sidebar/ProjectDialog.scss';

const projectDialogSchema = z.object({ name: z.string().trim().min(1, 'Project name is required.') });
const projectDialogInitialFormState: ProjectDialogFormState = {};

type ProjectDialogMode = 'create' | 'rename';

type ProjectDialogFormState = Readonly<{ validationError?: string; submissionError?: string }>;

export type ProjectDialogSubmitData = z.infer<typeof projectDialogSchema>;

type Props = Readonly<{
    visible: boolean;
    mode: ProjectDialogMode;
    initialName?: string;
    pending?: boolean;
    errorMessage?: string;
    onCancel: () => void;
    onSubmit: (data: ProjectDialogSubmitData) => void | Promise<void>;
}>;

type ProjectDialogFormProps = Readonly<{
    mode: ProjectDialogMode;
    initialName: string;
    pending: boolean;
    errorMessage?: string;
    onCancel: () => void;
    onSubmit: (data: ProjectDialogSubmitData) => void | Promise<void>;
}>;

type ProjectDialogSubmitButtonProps = Readonly<{ mode: ProjectDialogMode; pending: boolean }>;

function getDialogHeading(mode: ProjectDialogMode): string {
    return mode === 'create' ? 'Create project' : 'Rename project';
}

function getSubmitLabel(mode: ProjectDialogMode, pending: boolean): string {
    if (pending) {
        return mode === 'create' ? 'Creating …' : 'Renaming …';
    }

    return mode === 'create' ? 'Create' : 'Rename';
}

function getInputClassName(invalid: boolean): string {
    return invalid ? 'project-dialog__input project-dialog__input--invalid' : 'project-dialog__input';
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return 'The project could not be saved.';
}

function getProjectName(formData: FormData): string {
    const value = formData.get('name');

    return typeof value === 'string' ? value : '';
}

function ProjectDialogSubmitButton({ mode, pending: externalPending }: ProjectDialogSubmitButtonProps) {
    const { pending: formPending } = useFormStatus();
    const pending = externalPending || formPending;

    return (
        <Button
            type='submit'
            label={getSubmitLabel(mode, pending)}
            disabled={pending}
            pt={{ root: { className: 'project-dialog__button project-dialog__button--submit' } }}
        />
    );
}

function ProjectDialogForm({ mode, initialName, pending, errorMessage, onCancel, onSubmit }: ProjectDialogFormProps) {
    const inputId = useId();
    const errorId = useId();

    const [formState, formAction] = useActionState<ProjectDialogFormState, FormData>(
        async (_previousState, formData) => {
            const validationResult = projectDialogSchema.safeParse({ name: getProjectName(formData) });

            if (!validationResult.success) {
                return { validationError: validationResult.error.issues[0]?.message ?? 'Project name is invalid.' };
            }

            try {
                await onSubmit(validationResult.data);

                return projectDialogInitialFormState;
            } catch (error) {
                return { submissionError: getErrorMessage(error) };
            }
        },
        projectDialogInitialFormState,
    );

    function handleCancel(): void {
        if (pending) {
            return;
        }

        onCancel();
    }

    const currentErrorMessage = formState.validationError ?? formState.submissionError ?? errorMessage;
    const inputInvalid = currentErrorMessage !== undefined;

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
                    aria-invalid={inputInvalid}
                    aria-describedby={inputInvalid ? errorId : undefined}
                    pt={{ root: { className: getInputClassName(inputInvalid) } }}
                />

                {currentErrorMessage !== undefined && (
                    <p
                        id={errorId}
                        className='project-dialog__message project-dialog__message--error'>
                        {currentErrorMessage}
                    </p>
                )}
            </div>

            <div className='project-dialog__actions'>
                <Button
                    outlined
                    type='button'
                    label='Cancel'
                    disabled={pending}
                    pt={{ root: { className: 'project-dialog__button project-dialog__button--cancel' } }}
                    onClick={handleCancel}
                />

                <ProjectDialogSubmitButton
                    mode={mode}
                    pending={pending}
                />
            </div>
        </form>
    );
}

export function ProjectDialog({
    visible,
    mode,
    initialName = '',
    pending = false,
    errorMessage,
    onCancel,
    onSubmit,
}: Props) {
    function handleCancel(): void {
        if (pending) {
            return;
        }

        onCancel();
    }

    return (
        <Dialog
            visible={visible}
            modal
            dismissableMask={false}
            closable={false}
            closeOnEscape={false}
            draggable={false}
            resizable={false}
            header={<h2 className='project-dialog__heading'>{getDialogHeading(mode)}</h2>}
            pt={{
                root: { className: 'project-dialog' },
                header: { className: 'project-dialog__header' },
                content: { className: 'project-dialog__content' },
            }}
            onHide={handleCancel}>
            <ProjectDialogForm
                key={`${visible ? 'visible' : 'hidden'}:${mode}:${initialName}`}
                mode={mode}
                initialName={initialName}
                pending={pending}
                errorMessage={errorMessage}
                onCancel={onCancel}
                onSubmit={onSubmit}
            />
        </Dialog>
    );
}
