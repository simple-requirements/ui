import { Button } from 'primereact/button';

import type { ImplementationTicket } from '@/api/requirementsApi';

export type ImplementationTicketListProps = Readonly<{
    tickets: readonly ImplementationTicket[];
    editable: boolean;
    pending: boolean;
    onEdit: (ticket: ImplementationTicket) => void;
    onRemove: (ticketId: string) => Promise<void>;
}>;

/**
 * Renders tickets and optional edit/delete controls inside the ticket dialog.
 * @param props Ticket list data, permissions and callbacks.
 * @returns Ticket table or an empty-state message.
 */
export function ImplementationTicketList({
    tickets,
    editable,
    pending,
    onEdit,
    onRemove,
}: ImplementationTicketListProps) {
    if (tickets.length === 0) {
        return <p className='implementation-tickets-panel__empty'>No implementation tickets.</p>;
    }

    return (
        <div className='implementation-tickets-panel__table-wrapper'>
            <table className='implementation-tickets-panel__table'>
                <thead>
                    <tr>
                        <th scope='col'>Ticket ID</th>
                        <th scope='col'>Completed by</th>
                        <th scope='col'>Completion date</th>
                        {editable && <th scope='col'>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((ticket) => (
                        <ImplementationTicketTableRow
                            key={ticket.id}
                            ticket={ticket}
                            editable={editable}
                            pending={pending}
                            onEdit={onEdit}
                            onRemove={onRemove}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

type ImplementationTicketTableRowProps = Readonly<{
    ticket: ImplementationTicket;
    editable: boolean;
    pending: boolean;
    onEdit: (ticket: ImplementationTicket) => void;
    onRemove: (ticketId: string) => Promise<void>;
}>;

/**
 * Renders one implementation-ticket table row with optional mutation controls.
 * @param props Ticket row data and callbacks.
 * @returns Implementation-ticket table row.
 */
function ImplementationTicketTableRow({
    ticket,
    editable,
    pending,
    onEdit,
    onRemove,
}: ImplementationTicketTableRowProps) {
    return (
        <tr>
            <td>{ticket.ticketId}</td>
            <td>{ticket.completedBy}</td>
            <td>{ticket.completedAt}</td>
            {editable && (
                <td className='implementation-tickets-panel__table-actions'>
                    <Button
                        type='button'
                        text
                        label='Edit ticket'
                        disabled={pending}
                        onClick={() => onEdit(ticket)}
                    />
                    <Button
                        type='button'
                        text
                        severity='danger'
                        label='Delete ticket'
                        disabled={pending}
                        onClick={() => void onRemove(ticket.id)}
                    />
                </td>
            )}
        </tr>
    );
}
