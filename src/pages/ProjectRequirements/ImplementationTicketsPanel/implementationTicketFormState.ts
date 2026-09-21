/** Form values used while creating or editing an implementation ticket. */
export type ImplementationTicketFormState = Readonly<{ ticketId: string; completedBy: string; completedAt: string }>;

/** Field names accepted by the implementation-ticket editor. */
export type ImplementationTicketFormField = keyof ImplementationTicketFormState;

/** Empty implementation-ticket form state. */
export const emptyImplementationTicketForm: ImplementationTicketFormState = {
    ticketId: '',
    completedBy: '',
    completedAt: '',
};

/**
 * Checks whether all required implementation-ticket fields contain values.
 * @param form Form state to validate.
 * @returns Whether the ticket can be submitted.
 */
export function isImplementationTicketFormValid(form: ImplementationTicketFormState): boolean {
    return form.ticketId.trim().length > 0 && form.completedBy.trim().length > 0 && form.completedAt.trim().length > 0;
}
