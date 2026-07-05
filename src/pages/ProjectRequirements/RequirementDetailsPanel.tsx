import type { ElementType } from "react";

import type { Requirement } from "@/api/requirementsApi";
import { InlineStatus } from "@/components/Feedback/InlineStatus";

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

function formatStatus(status: Requirement["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
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
      <TitleElement id={titleId} className="requirement-details-panel__title">
        {title}
      </TitleElement>

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
            <dd>{formatStatus(requirement.status)}</dd>
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
        </dl>
      )}
    </div>
  );
}
