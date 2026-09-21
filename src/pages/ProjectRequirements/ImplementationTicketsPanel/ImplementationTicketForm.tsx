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
        <div className='implementation-tickets-panel__form ui-form--dialog ui-form--dialog-spacious'>
            <div className='implementation-tickets-panel__field ui-field--dialog'>
                <label
                    className='implementation-tickets-panel__label ui-label'
                    htmlFor='implementation-ticket-id'>
                    Ticket ID
                </label>
                <InputText
                    id='implementation-ticket-id'
                    className='implementation-tickets-panel__input ui-control ui-control--dialog'
                    value={form.ticketId}
                    disabled={pending}
                    onChange={(event) => onUpdateField('ticketId', event.currentTarget.value)}
                />
            </div>

            <div className='implementation-tickets-panel__field ui-field--dialog'>
                <label
                    className='implementation-tickets-panel__label ui-label'
                    htmlFor='implementation-ticket-completed-by'>
                    Completed by
                </label>
                <InputText
                    id='implementation-ticket-completed-by'
                    className='implementation-tickets-panel__input ui-control ui-control--dialog'
                    value={form.completedBy}
                    disabled={pending}
                    onChange={(event) => onUpdateField('completedBy', event.currentTarget.value)}
                />
            </div>

            <div className='implementation-tickets-panel__field ui-field--dialog'>
                <label
                    className='implementation-tickets-panel__label ui-label'
                    htmlFor='implementation-ticket-completed-at'>
                    Completion date
                </label>
                <input
                    id='implementation-ticket-completed-at'
                    className='implementation-tickets-panel__input ui-control ui-control--dialog'
                    type='date'
                    value={form.completedAt}
                    disabled={pending}
                    onChange={(event) => onUpdateField('completedAt', event.currentTarget.value)}
                />
            </div>

            <div className='implementation-tickets-panel__form-actions ui-dialog__actions ui-dialog__actions--flush'>
                {editing !== undefined && (
                    <Button
                        type='button'
                        outlined
                        label='Abort'
                        disabled={pending}
                        pt={{ root: { className: 'ui-button ui-button--outline ui-button--dialog' } }}
                        onClick={onAbortEditing}
                    />
                )}
                <Button
                    type='button'
                    label={editing === undefined ? 'Add ticket' : 'Save ticket'}
                    disabled={!valid || pending}
                    loading={pending}
                    pt={{ root: { className: 'ui-button ui-button--primary ui-button--dialog' } }}
                    onClick={() => void onSubmit()}
                />
            </div>
        </div>
    );
}
