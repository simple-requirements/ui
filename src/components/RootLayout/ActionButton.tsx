import { Button } from 'primereact/button';

type ActionButtonProps = Readonly<{ onNewProject?: () => void; onSynchronize?: () => void }>;

export function ActionButton({ onNewProject, onSynchronize }: ActionButtonProps) {
    return (
        <>
            <Button
                type='button'
                icon='pi pi-cloud-download'
                aria-label='Synchronize projects'
                onClick={onSynchronize}
                pt={{
                    root: { className: 'sidebar__actions-button sidebar__actions-button--ghost' },
                    icon: { className: 'sidebar__actions-button-icon' },
                }}
            />

            <Button
                type='button'
                label='New project'
                onClick={onNewProject}
                pt={{
                    root: { className: 'sidebar__actions-button' },
                    label: { className: 'sidebar__actions-button-label' },
                }}
            />
        </>
    );
}
