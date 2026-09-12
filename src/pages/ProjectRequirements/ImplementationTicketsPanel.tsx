import { Dialog } from 'primereact/dialog';

import type { Requirement } from '@/api/requirementsApi';
import { useProjectPermissions } from '@/auth/projectPermissions';
import { ImplementationTicketForm } from '@/pages/ProjectRequirements/ImplementationTicketsPanel/ImplementationTicketForm';
import { ImplementationTicketList } from '@/pages/ProjectRequirements/ImplementationTicketsPanel/ImplementationTicketList';
import { useImplementationTicketEditor } from '@/pages/ProjectRequirements/ImplementationTicketsPanel/useImplementationTicketEditor';

export type ImplementationTicketsPanelProps = Readonly<{
    requirement: Requirement;
    visible: boolean;
    onHide: () => void;
}>;

/**
 * Renders the modal editor for implementation tickets of an approved requirement.
 * @param requirement Requirement whose tickets are managed.
 * @param visible Whether the ticket dialog is open.
 * @param onHide Callback used to close the dialog.
 * @returns Implementation-ticket management dialog.
 */
export function ImplementationTicketsPanel({ requirement, visible, onHide }: ImplementationTicketsPanelProps) {
    const permissions = useProjectPermissions(requirement.projectId);
    const editable = requirement.status === 'approved' && permissions.canManageTickets;
    const editor = useImplementationTicketEditor({ requirement, editable });

    return (
        <Dialog
            visible={visible}
            modal
            dismissableMask={false}
            closable={!editor.pending}
            closeOnEscape={!editor.pending}
            draggable={false}
            resizable={false}
            header={<h2 className='implementation-tickets-dialog__heading'>Implementation tickets</h2>}
            pt={{
                root: { className: 'implementation-tickets-dialog' },
                header: { className: 'implementation-tickets-dialog__header' },
                content: { className: 'implementation-tickets-dialog__content' },
            }}
            onHide={onHide}>
            {editable && (
                <ImplementationTicketForm
                    form={editor.form}
                    editing={editor.editing}
                    pending={editor.pending}
                    valid={editor.valid}
                    onUpdateField={editor.updateFormField}
                    onSubmit={editor.submit}
                    onAbortEditing={editor.abortEditing}
                />
            )}

            <ImplementationTicketList
                tickets={requirement.implementationTickets}
                editable={editable}
                pending={editor.pending}
                onEdit={editor.edit}
                onRemove={editor.remove}
            />
        </Dialog>
    );
}
