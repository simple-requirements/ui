import { useState } from 'react';

import { queryClient } from '@/api/queryClient';
import {
    createImplementationTicketRequest,
    deleteImplementationTicketRequest,
    getListProjectRequirementsQueryKey,
    updateImplementationTicketRequest,
    type ImplementationTicket,
    type Requirement,
} from '@/api/requirementsApi';
import { toastMessages } from '@/components/Feedback/AppToast/toastMessages';
import {
    emptyImplementationTicketForm,
    isImplementationTicketFormValid,
    type ImplementationTicketFormField,
    type ImplementationTicketFormState,
} from '@/pages/ProjectRequirements/ImplementationTicketsPanel/implementationTicketFormState';
import { showToastMessage } from '@/stores/toastStore';

type UseImplementationTicketEditorArgs = Readonly<{ requirement: Requirement; editable: boolean }>;

export type ImplementationTicketEditor = Readonly<{
    form: ImplementationTicketFormState;
    editing: ImplementationTicket | undefined;
    pending: boolean;
    valid: boolean;
    updateFormField: (field: ImplementationTicketFormField, value: string) => void;
    submit: () => Promise<void>;
    remove: (ticketId: string) => Promise<void>;
    edit: (ticket: ImplementationTicket) => void;
    abortEditing: () => void;
}>;

export function useImplementationTicketEditor({
    requirement,
    editable,
}: UseImplementationTicketEditorArgs): ImplementationTicketEditor {
    const [form, setForm] = useState<ImplementationTicketFormState>(emptyImplementationTicketForm);
    const [editing, setEditing] = useState<ImplementationTicket>();
    const [pending, setPending] = useState(false);
    const valid = isImplementationTicketFormValid(form);

    async function refresh(): Promise<void> {
        await queryClient.invalidateQueries({ queryKey: getListProjectRequirementsQueryKey(requirement.projectId) });
    }

    function resetForm(): void {
        setForm(emptyImplementationTicketForm);
        setEditing(undefined);
    }

    function updateFormField(field: ImplementationTicketFormField, value: string): void {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function submit(): Promise<void> {
        if (!editable || !valid) return;
        setPending(true);
        try {
            if (editing === undefined) {
                await createImplementationTicketRequest(requirement.projectId, requirement.id, form);
            } else {
                await updateImplementationTicketRequest(requirement.projectId, requirement.id, editing.id, form);
            }
            resetForm();
            await refresh();
            showToastMessage(toastMessages.implementationTicketSaved());
        } catch (error) {
            showToastMessage(
                toastMessages.implementationActionFailed(
                    error instanceof Error ? error.message : 'The ticket could not be saved.',
                ),
            );
        } finally {
            setPending(false);
        }
    }

    async function remove(ticketId: string): Promise<void> {
        if (!editable) return;
        setPending(true);
        try {
            await deleteImplementationTicketRequest(requirement.projectId, requirement.id, ticketId);
            await refresh();
            showToastMessage(toastMessages.implementationTicketDeleted());
        } catch (error) {
            showToastMessage(
                toastMessages.implementationActionFailed(
                    error instanceof Error ? error.message : 'The ticket could not be deleted.',
                ),
            );
        } finally {
            setPending(false);
        }
    }

    function edit(ticket: ImplementationTicket): void {
        if (!editable) return;
        setEditing(ticket);
        setForm({ ticketId: ticket.ticketId, completedBy: ticket.completedBy, completedAt: ticket.completedAt });
    }

    return { form, editing, pending, valid, updateFormField, submit, remove, edit, abortEditing: resetForm };
}
