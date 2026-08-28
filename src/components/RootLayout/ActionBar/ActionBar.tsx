import { useSelector } from "@tanstack/react-store";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router";

import "@/components/RootLayout/ActionBar/ActionBar.scss";

import {
  getActionBarConfiguration,
  getCreateRoute,
} from "@/components/RootLayout/ActionBar/actionBarConfiguration";
import { RequirementKeyLookup } from "@/components/RootLayout/ActionBar/RequirementKeyLookup";
import { useObsoleteRequirementAction } from "@/components/RootLayout/ActionBar/useObsoleteRequirementAction";
import { useImplementRequirementAction } from "@/components/RootLayout/ActionBar/useImplementRequirementAction";
import { RequirementLifecycleDialog } from "@/pages/ProjectRequirements/RequirementLifecycleDialog";
import {
  getProjectRequirementDetailsRoute,
  getProjectRequirementEditRoute,
  getProjectRequirementReviewRoute,
} from "@/router/projectRoutes";
import { useRouteUiMetadata } from "@/router/routeUiMetadata";
import { actionBarStore, requestReviewDecision } from "@/stores/actionBarStore";
import { openTab } from "@/stores/tabBarStore";

export type ActionBarProps = Readonly<{
  onFindRequirementKey?: (requirementKey: string) => void;
}>;

function isDraftRequirementStatus(status: string | undefined): boolean {
  return status?.toLowerCase() === "draft";
}

function canBecomeObsolete(status: string | undefined): boolean {
  return status === "approved" || status === "implemented";
}

export function ActionBar({ onFindRequirementKey }: ActionBarProps) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { actionBar: actionBarKind } = useRouteUiMetadata();
  const configuration = getActionBarConfiguration(actionBarKind);
  const reviewActionRequirement = useSelector(
    actionBarStore,
    (state) => state.reviewActionRequirement,
  );
  const obsoleteAction = useObsoleteRequirementAction(reviewActionRequirement);
  const implementAction = useImplementRequirementAction(reviewActionRequirement);

  const canCreate =
    configuration.createActionKind !== undefined &&
    !configuration.disabled &&
    projectId !== undefined;
  const isDraftRequirement = isDraftRequirementStatus(
    reviewActionRequirement?.status,
  );
  const canEditRequirement =
    configuration.showEditRequirement &&
    reviewActionRequirement !== undefined &&
    reviewActionRequirement.status !== "rejected";
  const canMarkObsolete =
    configuration.showObsoleteRequirement &&
    canBecomeObsolete(reviewActionRequirement?.status);
  const canMarkImplemented =
    configuration.showImplementedRequirement &&
    reviewActionRequirement?.status === "approved" &&
    (reviewActionRequirement.implementationTicketCount ?? 0) > 0;
  const canReview = configuration.showReview && isDraftRequirement;
  const canDecideReview =
    configuration.showReviewDecisions && isDraftRequirement;

  function handleCreate(): void {
    if (
      projectId === undefined ||
      configuration.createActionKind === undefined
    ) {
      return;
    }

    void navigate(getCreateRoute(projectId, configuration.createActionKind));
  }

  function handleEditRequirement(): void {
    if (reviewActionRequirement === undefined) {
      return;
    }
    const detailsRoute = getProjectRequirementDetailsRoute(
      reviewActionRequirement.projectId,
      reviewActionRequirement.requirementId,
    );
    const editRoute = getProjectRequirementEditRoute(
      reviewActionRequirement.projectId,
      reviewActionRequirement.requirementId,
    );
    openTab({
      id: detailsRoute,
      label: reviewActionRequirement.visibleKey,
      closable: true,
    });
    void navigate(
      configuration.showReviewDecisions
        ? `${editRoute}?returnTo=review`
        : editRoute,
    );
  }

  function handleReview(): void {
    if (reviewActionRequirement === undefined) {
      return;
    }
    void navigate(
      getProjectRequirementReviewRoute(
        reviewActionRequirement.projectId,
        reviewActionRequirement.requirementId,
      ),
    );
  }

  return (
    <section className="action-bar" aria-label={configuration.ariaLabel}>
      {configuration.showRequirementLookup && (
        <RequirementKeyLookup
          disabled={configuration.disabled}
          onFindKey={onFindRequirementKey}
        />
      )}

      {configuration.createActionKind !== undefined && (
        <Button
          type="button"
          label="Create"
          disabled={!canCreate}
          onClick={handleCreate}
          pt={{ root: { className: "action-bar__button" } }}
        />
      )}

      {canEditRequirement && (
        <Button
          type="button"
          label="Edit"
          onClick={handleEditRequirement}
          pt={{ root: { className: "action-bar__button" } }}
        />
      )}

      {canReview && (
        <Button
          type="button"
          label="Review"
          onClick={handleReview}
          pt={{ root: { className: "action-bar__button" } }}
        />
      )}

      {canMarkObsolete && (
        <Button
          type="button"
          label="Obsolete"
          onClick={obsoleteAction.open}
          pt={{ root: { className: "action-bar__button" } }}
        />
      )}

      {canMarkImplemented && (
        <Button type="button" label="Implemented" loading={implementAction.pending} onClick={() => void implementAction.implement()} pt={{ root: { className: "action-bar__button" } }} />
      )}

      {canDecideReview && (
        <>
          <Button
            type="button"
            label="Approve"
            pt={{
              root: {
                className:
                  "action-bar__decision-button action-bar__decision-button--approve",
              },
            }}
            onClick={() => requestReviewDecision("approve")}
          />
          <Button
            type="button"
            label="Reject"
            severity="danger"
            pt={{
              root: {
                className:
                  "action-bar__decision-button action-bar__decision-button--reject",
              },
            }}
            onClick={() => requestReviewDecision("reject")}
          />
        </>
      )}
      <RequirementLifecycleDialog
        key={
          obsoleteAction.visible
            ? reviewActionRequirement?.requirementId
            : "closed"
        }
        visible={obsoleteAction.visible}
        title="Mark requirement obsolete"
        nameLabel="Name"
        reasonRequired
        pending={obsoleteAction.pending}
        onAbort={obsoleteAction.abort}
        onConfirm={obsoleteAction.confirm}
      />
    </section>
  );
}
