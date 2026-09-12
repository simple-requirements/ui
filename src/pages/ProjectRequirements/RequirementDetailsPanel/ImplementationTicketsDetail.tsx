import type { Requirement } from '@/api/requirementsApi';
import { RequirementDetailsRow } from '@/pages/ProjectRequirements/RequirementDetailsPanel/RequirementDetailsRow';

const statusesWithImplementationTickets: readonly Requirement['status'][] = ['approved', 'implemented', 'obsolete'];

type ImplementationTicket = Requirement['implementationTickets'][number];

export type ImplementationTicketsDetailProps = Readonly<{ requirement: Requirement }>;

/**
 * Checks whether tickets belong in the requirement detail view for a lifecycle status.
 * @param status Requirement lifecycle status.
 * @returns True when implementation tickets should be displayed.
 */
function shouldShowImplementationTickets(status: Requirement['status']): boolean {
    return statusesWithImplementationTickets.includes(status);
}

/**
 * Renders a ticket identifier as text or a configured external link.
 * @param ticket Ticket whose identifier is displayed.
 * @returns Ticket label or link.
 */
function ImplementationTicketLabel({ ticket }: Readonly<{ ticket: ImplementationTicket }>) {
    return ticket.url === null ?
            ticket.ticketId
        :   <a
                href={ticket.url}
                target='_blank'
                rel='noreferrer'>
                {ticket.ticketId}
            </a>;
}

/**
 * Renders implementation tickets as a table inside requirement details.
 * @param requirement Requirement whose tickets are displayed.
 * @returns Ticket details row or null when tickets are not relevant to the status.
 */
export function ImplementationTicketsDetail({ requirement }: ImplementationTicketsDetailProps) {
    if (!shouldShowImplementationTickets(requirement.status)) {
        return null;
    }

    return (
        <RequirementDetailsRow label='Implementation tickets'>
            <table className='requirement-details-panel__tickets-table'>
                <thead>
                    <tr>
                        <th scope='col'>Ticket ID</th>
                        <th scope='col'>Completed by</th>
                        <th scope='col'>Completion date</th>
                    </tr>
                </thead>
                <tbody>
                    {requirement.implementationTickets.length === 0 ?
                        <tr>
                            <td colSpan={3}>No implementation tickets.</td>
                        </tr>
                    :   requirement.implementationTickets.map((ticket) => (
                            <tr key={ticket.id}>
                                <td>
                                    <ImplementationTicketLabel ticket={ticket} />
                                </td>
                                <td>{ticket.completedBy}</td>
                                <td>{ticket.completedAt}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </RequirementDetailsRow>
    );
}
