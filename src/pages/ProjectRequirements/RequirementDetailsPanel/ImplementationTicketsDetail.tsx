import type { Requirement } from '@/api/requirementsApi';
import { RequirementDetailsRow } from '@/pages/ProjectRequirements/RequirementDetailsPanel/RequirementDetailsRow';

const statusesWithImplementationTickets: readonly Requirement['status'][] = ['approved', 'implemented', 'obsolete'];

type ImplementationTicket = Requirement['implementationTickets'][number];

export type ImplementationTicketsDetailProps = Readonly<{ requirement: Requirement }>;

function shouldShowImplementationTickets(status: Requirement['status']): boolean {
    return statusesWithImplementationTickets.includes(status);
}

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

export function ImplementationTicketsDetail({ requirement }: ImplementationTicketsDetailProps) {
    if (!shouldShowImplementationTickets(requirement.status)) {
        return null;
    }

    return (
        <RequirementDetailsRow label='Implementation tickets'>
            {requirement.implementationTickets.length === 0 ?
                '—'
            :   <ul>
                    {requirement.implementationTickets.map((ticket) => (
                        <li key={ticket.id}>
                            <ImplementationTicketLabel ticket={ticket} />
                            {' — '}
                            {ticket.completedBy}, {ticket.completedAt}
                        </li>
                    ))}
                </ul>
            }
        </RequirementDetailsRow>
    );
}
