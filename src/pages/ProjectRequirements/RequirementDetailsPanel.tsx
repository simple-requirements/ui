import type { ElementType } from "react";

import type { Requirement } from "@/api/requirementsApi";
import { InlineStatus } from "@/components/Feedback/InlineStatus";
import { RequirementStatusBadge } from "@/pages/ProjectRequirements/RequirementStatusBadge";

import "@/pages/ProjectRequirements/RequirementDetailsPanel.scss";

export type RequirementDetailsPanelProps = Readonly<{
  requirement?: Requirement;
  title: string;
  titleElement?: "h1" | "h2";
  titleId?: string;
  emptyMessage?: string;
}>;

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNullableDateTime(value: string | null): string {
  return value === null ? "—" : formatDateTime(value);
}

function formatNullableValue(value: string | null): string {
  return value ?? "—";
}

export function RequirementDetailsPanel({
  requirement,
  title,
  titleElement = "h2",
  titleId,
  emptyMessage = "Select a requirement to show its details.",
}: RequirementDetailsPanelProps) {
  const TitleElement: ElementType = titleElement;

  return (
    <div className="requirement-details-panel" aria-live="polite">
      <div className="requirement-details-panel__header">
        <TitleElement id={titleId} className="requirement-details-panel__title">
          {title}
        </TitleElement>
      </div>

      {requirement === undefined ? (
        <InlineStatus kind="empty">{emptyMessage}</InlineStatus>
      ) : (
        <dl className="requirement-details-panel__details-list">
          <div className="requirement-details-panel__details-row">
            <dt>Key</dt>
            <dd>{requirement.visibleKey}</dd>
          </div>

          <div className="requirement-details-panel__details-row">
            <dt>Status</dt>
            <dd>
              <RequirementStatusBadge status={requirement.status} />
            </dd>
          </div>

          <div className="requirement-details-panel__details-row">
            <dt>Description</dt>
            <dd>{formatNullableValue(requirement.description)}</dd>
          </div>

          <div className="requirement-details-panel__details-row">
            <dt>Priority</dt>
            <dd>{formatNullableValue(requirement.priority)}</dd>
          </div>

          <div className="requirement-details-panel__details-row">
            <dt>Owner</dt>
            <dd>{formatNullableValue(requirement.owner)}</dd>
          </div>

          <div className="requirement-details-panel__details-row">
            <dt>Reviewer</dt>
            <dd>{formatNullableValue(requirement.reviewer)}</dd>
          </div>

          {requirement.status === "rejected" && (
            <>
              <div className="requirement-details-panel__details-row">
                <dt>Rejection reason</dt>
                <dd>{formatNullableValue(requirement.rejectionReason)}</dd>
              </div>

              <div className="requirement-details-panel__details-row">
                <dt>Rejected</dt>
                <dd>{formatNullableDateTime(requirement.rejectedAt)}</dd>
              </div>
            </>
          )}

          {requirement.status === "obsolete" && (
            <>
              <div className="requirement-details-panel__details-row">
                <dt>Obsoleted by</dt>
                <dd>{formatNullableValue(requirement.obsoletedBy)}</dd>
              </div>

              <div className="requirement-details-panel__details-row">
                <dt>Obsolescence reason</dt>
                <dd>{formatNullableValue(requirement.obsolescenceReason)}</dd>
              </div>

              <div className="requirement-details-panel__details-row">
                <dt>Obsolete</dt>
                <dd>{formatNullableDateTime(requirement.obsoleteAt)}</dd>
              </div>
            </>
          )}

          <div className="requirement-details-panel__details-row">
            <dt>Rationale</dt>
            <dd>{formatNullableValue(requirement.rationale)}</dd>
          </div>

          <div className="requirement-details-panel__details-row">
            <dt>Source</dt>
            <dd>{formatNullableValue(requirement.source)}</dd>
          </div>

          <div className="requirement-details-panel__details-row">
            <dt>Created</dt>
            <dd>{formatDateTime(requirement.createdAt)}</dd>
          </div>

          <div className="requirement-details-panel__details-row">
            <dt>Updated</dt>
            <dd>{formatDateTime(requirement.updatedAt)}</dd>
          </div>

          <div className="requirement-details-panel__details-row">
            <dt>Approved</dt>
            <dd>{formatNullableDateTime(requirement.approvedAt)}</dd>
          </div>

          <div className="requirement-details-panel__details-row">
            <dt>Implemented</dt>
            <dd>{formatNullableDateTime(requirement.implementedAt)}</dd>
          </div>
          {["approved", "implemented", "obsolete"].includes(requirement.status) && (
            <div className="requirement-details-panel__details-row">
              <dt>Implementation tickets</dt>
              <dd>
                {requirement.implementationTickets.length === 0 ? "—" : (
                  <ul>
                    {requirement.implementationTickets.map((ticket) => (
                      <li key={ticket.id}>
                        {ticket.url === null ? ticket.ticketId : <a href={ticket.url} target="_blank" rel="noreferrer">{ticket.ticketId}</a>}
                        {" — "}{ticket.completedBy}, {ticket.completedAt}
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
