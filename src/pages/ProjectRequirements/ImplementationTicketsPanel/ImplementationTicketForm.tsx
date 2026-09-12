import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

import type { ImplementationTicket } from '@/api/requirementsApi';
import type {
    ImplementationTicketFormField,
    ImplementationTicketFormState,
} from '@/pages/ProjectRequirements/ImplementationTicketsPanel/implementationTicketFormState';

export type ImplementationTicketFormProps = Readonly<{
    form: ImplementationTicketFormState;
    editing: ImplementationTicket | undefined;
    pending: boolean;
    valid: boolean;
    onUpdateField: (field: ImplementationTicketFormField, value: string) => void;
    onSubmit: () => Promise<void>;
    onAbortEditing: () => void;
}>;

/**
 * Renders the editable implementation-ticket fields and form actions.
 * @param props Ticket form state and callbacks.
 * @returns Implementation-ticket editor form.
 */
export function ImplementationTicketForm({
    form,
    editing,
    pending,
    valid,
    onUpdateField,
    onSubmit,
    onAbortEditing,
}: ImplementationTicketFormProps) {
    return (
        <div className='implementation-tickets-panel__form'>
            <label htmlFor='implementation-ticket-id'>Ticket ID</label>
            <InputText
                id='implementation-ticket-id'
                value={form.ticketId}
                disabled={pending}
                onChange={(event) => onUpdateField('ticketId', event.currentTarget.value)}
            />

            <label htmlFor='implementation-ticket-completed-by'>Completed by</label>
            <InputText
                id='implementation-ticket-completed-by'
                value={form.completedBy}
                disabled={pending}
                onChange={(event) => onUpdateField('completedBy', event.currentTarget.value)}
            />

            <label htmlFor='implementation-ticket-completed-at'>Completion date</label>
            <input
                id='implementation-ticket-completed-at'
                type='date'
                value={form.completedAt}
                disabled={pending}
                onChange={(event) => onUpdateField('completedAt', event.currentTarget.value)}
            />

            <div className='implementation-tickets-panel__form-actions'>
                {editing !== undefined && (
                    <Button
                        type='button'
                        outlined
                        label='Abort'
                        disabled={pending}
                        pt={{
                            root: {
                                className:
                                    'implementation-tickets-panel__button implementation-tickets-panel__button--abort',
                            },
                        }}
                        onClick={onAbortEditing}
                    />
                )}
                <Button
                    type='button'
                    label={editing === undefined ? 'Add ticket' : 'Save ticket'}
                    disabled={!valid || pending}
                    loading={pending}
                    pt={{
                        root: {
                            className:
                                'implementation-tickets-panel__button implementation-tickets-panel__button--submit',
                        },
                    }}
                    onClick={() => void onSubmit()}
                />
            </div>
        </div>
    );
}
