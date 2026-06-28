import { Button } from 'primereact/button';

import '@/components/RootLayout/Sidebar/ActionButton.scss';

type Props = Readonly<{ onNewProject?: () => void; onSynchronize?: () => void }>;

export function ActionButton({ onNewProject, onSynchronize }: Props) {
    return (
        <>
            <Button
                type='button'
                icon='pi pi-cloud-download'
                aria-label='Synchronize projects'
                onClick={onSynchronize}
                pt={{
                    root: { className: 'sidebar-action-button sidebar-action-button--ghost' },
                    icon: { className: 'sidebar-action-button__icon' },
                }}
            />

            <Button
                type='button'
                label='New project'
                onClick={onNewProject}
                pt={{
                    root: { className: 'sidebar-action-button' },
                    label: { className: 'sidebar-action-button__label' },
                }}
            />
        </>
    );
}
