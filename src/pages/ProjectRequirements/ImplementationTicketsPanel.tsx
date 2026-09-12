import type { Requirement } from '@/api/requirementsApi';
import { useProjectPermissions } from '@/auth/projectPermissions';
import { ImplementationTicketForm } from '@/pages/ProjectRequirements/ImplementationTicketsPanel/ImplementationTicketForm';
import { ImplementationTicketList } from '@/pages/ProjectRequirements/ImplementationTicketsPanel/ImplementationTicketList';
import { useImplementationTicketEditor } from '@/pages/ProjectRequirements/ImplementationTicketsPanel/useImplementationTicketEditor';

const visibleRequirementStatuses = ['approved', 'implemented', 'obsolete'];

export function ImplementationTicketsPanel({ requirement }: Readonly<{ requirement: Requirement }>) {
    const permissions = useProjectPermissions(requirement.projectId);
    const editable = requirement.status === 'approved' && permissions.canManageTickets;
    const editor = useImplementationTicketEditor({ requirement, editable });

    if (!visibleRequirementStatuses.includes(requirement.status)) return null;

    return (
        <section
            className='implementation-tickets-panel'
            aria-labelledby='implementation-tickets-title'>
            <h2 id='implementation-tickets-title'>Implementation tickets</h2>

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
        </section>
    );
}
