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
            <label>
                Ticket ID
                <InputText
                    value={form.ticketId}
                    onChange={(event) => onUpdateField('ticketId', event.currentTarget.value)}
                />
            </label>
            <label>
                Completion date
                <input
                    type='date'
                    value={form.completedAt}
                    onChange={(event) => onUpdateField('completedAt', event.currentTarget.value)}
                />
            </label>
            <div>
                {editing !== undefined && (
                    <Button
                        type='button'
                        outlined
                        label='Abort'
                        onClick={onAbortEditing}
                    />
                )}
                <Button
                    type='button'
                    label={editing === undefined ? 'Add ticket' : 'Save ticket'}
                    disabled={!valid}
                    loading={pending}
                    onClick={() => void onSubmit()}
                />
            </div>
        </div>
    );
}
