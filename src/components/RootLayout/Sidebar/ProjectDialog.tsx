import { Dialog } from 'primereact/dialog';

import '@/components/RootLayout/Sidebar/ProjectDialog.scss';

import { ProjectDialogForm, type ProjectDialogMode } from '@/components/RootLayout/Sidebar/ProjectDialogForm';
import type { ProjectDialogSubmitData } from '@/components/RootLayout/Sidebar/projectDialogValidation';

export type { ProjectDialogSubmitData } from '@/components/RootLayout/Sidebar/projectDialogValidation';

type Props = Readonly<{
    visible: boolean;
    mode: ProjectDialogMode;
    initialName?: string;
    pending?: boolean;
    errorMessage?: string;
    onCancel: () => void;
    onSubmit: (data: ProjectDialogSubmitData) => void | Promise<void>;
}>;

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
        if (!pending) onCancel();
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
            header={
                <h2 className="project-dialog__heading">{mode === 'create' ? 'Create project' : 'Rename project'}</h2>
            }
            pt={{
                root: { className: 'project-dialog' },
                header: { className: 'project-dialog__header' },
                content: { className: 'project-dialog__content' },
            }}
            onHide={handleCancel}
        >
            <ProjectDialogForm
                key={`${visible ? 'visible' : 'hidden'}:${mode}:${initialName}`}
                mode={mode}
                initialName={initialName}
                pending={pending}
                errorMessage={errorMessage}
                onCancel={handleCancel}
                onSubmit={onSubmit}
            />
        </Dialog>
    );
}
