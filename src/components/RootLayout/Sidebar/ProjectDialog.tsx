import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { type SubmitEvent, useEffect, useId, useState } from 'react';
import { z } from 'zod';

import '@/components/RootLayout/Sidebar/ProjectDialog.scss';

const projectDialogSchema = z.object({ name: z.string().trim().min(1, 'Project name is required.') });

type ProjectDialogMode = 'create' | 'rename';

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

export function ProjectDialog({
    visible,
    mode,
    initialName = '',
    pending = false,
    errorMessage,
    onCancel,
    onSubmit,
}: Props) {
    const inputId = useId();
    const errorId = useId();

    const [projectName, setProjectName] = useState(initialName);
    const [validationError, setValidationError] = useState<string>();

    useEffect(() => {
        if (visible) {
            setProjectName(initialName);
            setValidationError(undefined);
        }
    }, [initialName, visible]);

    async function handleSubmit(event: SubmitEvent): Promise<void> {
        event.preventDefault();

        const validationResult = projectDialogSchema.safeParse({ name: projectName });

        if (!validationResult.success) {
            setValidationError(validationResult.error.issues[0]?.message ?? 'Project name is invalid.');
            return;
        }

        setValidationError(undefined);
        await onSubmit(validationResult.data);
    }

    function handleCancel(): void {
        if (pending) {
            return;
        }

        setProjectName(initialName);
        setValidationError(undefined);
        onCancel();
    }

    const currentErrorMessage = validationError ?? errorMessage;
    const inputInvalid = currentErrorMessage !== undefined;

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
            <form
                className='project-dialog__form'
                noValidate
                onSubmit={(event) => {
                    void handleSubmit(event);
                }}>
                <div className='project-dialog__field'>
                    <label
                        className='project-dialog__label'
                        htmlFor={inputId}>
                        Project name
                    </label>

                    <InputText
                        id={inputId}
                        value={projectName}
                        autoFocus
                        aria-invalid={inputInvalid}
                        aria-describedby={inputInvalid ? errorId : undefined}
                        pt={{ root: { className: getInputClassName(inputInvalid) } }}
                        onChange={(event) => {
                            setProjectName(event.currentTarget.value);
                            setValidationError(undefined);
                        }}
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

                    <Button
                        type='submit'
                        label={getSubmitLabel(mode, pending)}
                        disabled={pending}
                        pt={{ root: { className: 'project-dialog__button project-dialog__button--submit' } }}
                    />
                </div>
            </form>
        </Dialog>
    );
}
