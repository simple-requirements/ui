export type ImplementationTicketFormState = Readonly<{ ticketId: string; completedAt: string }>;

export type ImplementationTicketFormField = keyof ImplementationTicketFormState;

export const emptyImplementationTicketForm: ImplementationTicketFormState = { ticketId: '', completedAt: '' };

export function isImplementationTicketFormValid(form: ImplementationTicketFormState): boolean {
    return form.ticketId.trim().length > 0 && form.completedAt.trim().length > 0;
}
