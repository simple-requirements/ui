import { Button } from "primereact/button";

import type { ImplementationTicket } from "@/api/requirementsApi";

export type ImplementationTicketListProps = Readonly<{
  tickets: readonly ImplementationTicket[];
  editable: boolean;
  pending: boolean;
  onEdit: (ticket: ImplementationTicket) => void;
  onRemove: (ticketId: string) => Promise<void>;
}>;

export function ImplementationTicketList({
  tickets,
  editable,
  pending,
  onEdit,
  onRemove,
}: ImplementationTicketListProps) {
  if (tickets.length === 0) {
    return <p>No implementation tickets.</p>;
  }

  return (
    <ul>
      {tickets.map((ticket) => (
        <ImplementationTicketListItem
          key={ticket.id}
          ticket={ticket}
          editable={editable}
          pending={pending}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

type ImplementationTicketListItemProps = Readonly<{
  ticket: ImplementationTicket;
  editable: boolean;
  pending: boolean;
  onEdit: (ticket: ImplementationTicket) => void;
  onRemove: (ticketId: string) => Promise<void>;
}>;

function ImplementationTicketListItem({
  ticket,
  editable,
  pending,
  onEdit,
  onRemove,
}: ImplementationTicketListItemProps) {
  return (
    <li>
      <span>
        {ticket.ticketId} — {ticket.completedBy}, {ticket.completedAt}
      </span>
      {editable && (
        <>
          <Button
            type="button"
            text
            label="Edit ticket"
            onClick={() => onEdit(ticket)}
          />
          <Button
            type="button"
            text
            severity="danger"
            label="Delete ticket"
            disabled={pending}
            onClick={() => void onRemove(ticket.id)}
          />
        </>
      )}
    </li>
  );
}
