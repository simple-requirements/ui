import type { Requirement } from "@/api/requirementsApi";
import { RequirementStatusBadge } from "@/pages/ProjectRequirements/RequirementStatusBadge";
import { ImplementationTicketsDetail } from "@/pages/ProjectRequirements/RequirementDetailsPanel/ImplementationTicketsDetail";
import { RequirementDetailsRow } from "@/pages/ProjectRequirements/RequirementDetailsPanel/RequirementDetailsRow";
import {
  formatDateTime,
  formatNullableDateTime,
  formatNullableValue,
} from "@/utils/displayFormatters";

export type RequirementDetailsListProps = Readonly<{
  requirement: Requirement;
}>;

export function RequirementDetailsList({
  requirement,
}: RequirementDetailsListProps) {
  return (
    <dl className="requirement-details-panel__details-list">
      <RequirementDetailsRow label="Key">
        {requirement.visibleKey}
      </RequirementDetailsRow>

      <RequirementDetailsRow label="Status">
        <RequirementStatusBadge status={requirement.status} />
      </RequirementDetailsRow>

      <RequirementDetailsRow label="Description">
        {formatNullableValue(requirement.description)}
      </RequirementDetailsRow>

      <RequirementDetailsRow label="Priority">
        {formatNullableValue(requirement.priority)}
      </RequirementDetailsRow>

      <RequirementDetailsRow label="Owner">
        {formatNullableValue(requirement.owner)}
      </RequirementDetailsRow>

      <RequirementDetailsRow label="Reviewer">
        {formatNullableValue(requirement.reviewer)}
      </RequirementDetailsRow>

      {requirement.status === "rejected" && (
        <>
          <RequirementDetailsRow label="Rejection reason">
            {formatNullableValue(requirement.rejectionReason)}
          </RequirementDetailsRow>

          <RequirementDetailsRow label="Rejected">
            {formatNullableDateTime(requirement.rejectedAt)}
          </RequirementDetailsRow>
        </>
      )}

      {requirement.status === "obsolete" && (
        <>
          <RequirementDetailsRow label="Obsoleted by">
            {formatNullableValue(requirement.obsoletedBy)}
          </RequirementDetailsRow>

          <RequirementDetailsRow label="Obsolescence reason">
            {formatNullableValue(requirement.obsolescenceReason)}
          </RequirementDetailsRow>

          <RequirementDetailsRow label="Obsolete">
            {formatNullableDateTime(requirement.obsoleteAt)}
          </RequirementDetailsRow>
        </>
      )}

      <RequirementDetailsRow label="Rationale">
        {formatNullableValue(requirement.rationale)}
      </RequirementDetailsRow>

      <RequirementDetailsRow label="Source">
        {formatNullableValue(requirement.source)}
      </RequirementDetailsRow>

      <RequirementDetailsRow label="Created">
        {formatDateTime(requirement.createdAt)}
      </RequirementDetailsRow>

      <RequirementDetailsRow label="Updated">
        {formatDateTime(requirement.updatedAt)}
      </RequirementDetailsRow>

      <RequirementDetailsRow label="Approved">
        {formatNullableDateTime(requirement.approvedAt)}
      </RequirementDetailsRow>

      <RequirementDetailsRow label="Implemented">
        {formatNullableDateTime(requirement.implementedAt)}
      </RequirementDetailsRow>

      <ImplementationTicketsDetail requirement={requirement} />
    </dl>
  );
}
