import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";

import { queryClient } from "@/api/queryClient";
import {
  createImplementationTicketRequest,
  deleteImplementationTicketRequest,
  getListProjectRequirementsQueryKey,
  updateImplementationTicketRequest,
  type ImplementationTicket,
  type Requirement,
} from "@/api/requirementsApi";
import { useProjectPermissions } from "@/auth/projectPermissions";
import { toastMessages } from "@/components/Feedback/AppToast/toastMessages";
import { showToastMessage } from "@/stores/toastStore";

type FormState = Readonly<{
  ticketId: string;
  completedAt: string;
}>;

const emptyForm: FormState = {
  ticketId: "",
  completedAt: "",
};

export function ImplementationTicketsPanel({
  requirement,
}: Readonly<{ requirement: Requirement }>) {
  const permissions = useProjectPermissions(requirement.projectId);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<ImplementationTicket>();
  const [pending, setPending] = useState(false);

  const visible = ["approved", "implemented", "obsolete"].includes(
    requirement.status,
  );
  if (!visible) return null;

  const editable =
    requirement.status === "approved" && permissions.canManageTickets;
  const valid = form.ticketId.trim().length > 0 && form.completedAt.trim().length > 0;

  async function refresh(): Promise<void> {
    await queryClient.invalidateQueries({
      queryKey: getListProjectRequirementsQueryKey(requirement.projectId),
    });
  }

  async function submit(): Promise<void> {
    if (!editable || !valid) return;
    setPending(true);
    try {
      if (editing === undefined) {
        await createImplementationTicketRequest(
          requirement.projectId,
          requirement.id,
          form,
        );
      } else {
        await updateImplementationTicketRequest(
          requirement.projectId,
          requirement.id,
          editing.id,
          form,
        );
      }
      setForm(emptyForm);
      setEditing(undefined);
      await refresh();
      showToastMessage(toastMessages.implementationTicketSaved());
    } catch (error) {
      showToastMessage(
        toastMessages.implementationActionFailed(
          error instanceof Error
            ? error.message
            : "The ticket could not be saved.",
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
      await deleteImplementationTicketRequest(
        requirement.projectId,
        requirement.id,
        ticketId,
      );
      await refresh();
      showToastMessage(toastMessages.implementationTicketDeleted());
    } catch (error) {
      showToastMessage(
        toastMessages.implementationActionFailed(
          error instanceof Error
            ? error.message
            : "The ticket could not be deleted.",
        ),
      );
    } finally {
      setPending(false);
    }
  }

  function edit(ticket: ImplementationTicket): void {
    if (!editable) return;
    setEditing(ticket);
    setForm({
      ticketId: ticket.ticketId,
      completedAt: ticket.completedAt,
    });
  }

  return (
    <section
      className="implementation-tickets-panel"
      aria-labelledby="implementation-tickets-title"
    >
      <h2 id="implementation-tickets-title">Implementation tickets</h2>

      {editable && (
        <div className="implementation-tickets-panel__form">
          <label>
            Ticket ID
            <InputText
              value={form.ticketId}
              onChange={(event) =>
                setForm({ ...form, ticketId: event.currentTarget.value })
              }
            />
          </label>
          <label>
            Completion date
            <input
              type="date"
              value={form.completedAt}
              onChange={(event) =>
                setForm({ ...form, completedAt: event.currentTarget.value })
              }
            />
          </label>
          <div>
            {editing !== undefined && (
              <Button
                type="button"
                outlined
                label="Abort"
                onClick={() => {
                  setEditing(undefined);
                  setForm(emptyForm);
                }}
              />
            )}
            <Button
              type="button"
              label={editing === undefined ? "Add ticket" : "Save ticket"}
              disabled={!valid}
              loading={pending}
              onClick={() => void submit()}
            />
          </div>
        </div>
      )}

      {requirement.implementationTickets.length === 0 ? (
        <p>No implementation tickets.</p>
      ) : (
        <ul>
          {requirement.implementationTickets.map((ticket) => (
            <li key={ticket.id}>
              <span>
                {ticket.ticketId} — {ticket.completedBy}, {ticket.completedAt}
              </span>
              {editable && (
                <>
                  <Button
                    type="button"
                    text
                    label="Edit ticket"
                    onClick={() => edit(ticket)}
                  />
                  <Button
                    type="button"
                    text
                    severity="danger"
                    label="Delete ticket"
                    disabled={pending}
                    onClick={() => void remove(ticket.id)}
                  />
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
