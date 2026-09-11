import { useSelector } from "@tanstack/react-store";
import { useNavigate, useParams } from "react-router";

import "@/components/RootLayout/ActionBar/ActionBar.scss";

import {
    canBecomeObsolete,
    isDraftRequirementStatus,
} from "@/components/RootLayout/ActionBar/actionBarRequirementStatus";
import {
    CreateActionButton,
    RequirementRouteActionButtons,
    ReviewDecisionActionButtons,
} from "@/components/RootLayout/ActionBar/ActionBarButtons";
import {
    getActionBarConfiguration,
    getCreateRoute,
} from "@/components/RootLayout/ActionBar/actionBarConfiguration";
import { RequirementKeyLookup } from "@/components/RootLayout/ActionBar/RequirementKeyLookup";
import { useImplementRequirementAction } from "@/components/RootLayout/ActionBar/useImplementRequirementAction";
import { useObsoleteRequirementAction } from "@/components/RootLayout/ActionBar/useObsoleteRequirementAction";
import { useProjectPermissions } from "@/auth/projectPermissions";
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

export function ActionBar({ onFindRequirementKey }: ActionBarProps) {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { actionBar: actionBarKind } = useRouteUiMetadata();
    const configuration = getActionBarConfiguration(actionBarKind);
    const permissions = useProjectPermissions(projectId);
    const reviewActionRequirement = useSelector(
        actionBarStore,
        (state) => state.reviewActionRequirement,
    );
    const obsoleteAction = useObsoleteRequirementAction(reviewActionRequirement);
    const implementAction = useImplementRequirementAction(reviewActionRequirement);

    const showCreate =
        configuration.createActionKind !== undefined &&
        permissions.canManageRequirements;
    const canCreate =
        showCreate && !configuration.disabled && projectId !== undefined;
    const isDraftRequirement = isDraftRequirementStatus(
        reviewActionRequirement?.status,
    );
    const canEditRequirement =
        configuration.showEditRequirement &&
        permissions.canManageRequirements &&
        reviewActionRequirement !== undefined &&
        reviewActionRequirement.status !== "rejected";
    const canMarkObsolete =
        configuration.showObsoleteRequirement &&
        permissions.canManageRequirements &&
        canBecomeObsolete(reviewActionRequirement?.status);
    const canMarkImplemented =
        configuration.showImplementedRequirement &&
        permissions.canManageRequirements &&
        reviewActionRequirement?.status === "approved" &&
        (reviewActionRequirement.implementationTicketCount ?? 0) > 0;
    const canReview =
        configuration.showReview &&
        permissions.canManageRequirements &&
        isDraftRequirement;
    const canDecideReview =
        configuration.showReviewDecisions &&
        permissions.canManageRequirements &&
        isDraftRequirement;

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

            {showCreate && (
                <CreateActionButton disabled={!canCreate} onCreate={handleCreate} />
            )}

            <RequirementRouteActionButtons
                canEdit={canEditRequirement}
                canReview={canReview}
                canMarkObsolete={canMarkObsolete}
                canMarkImplemented={canMarkImplemented}
                implementPending={implementAction.pending}
                onEdit={handleEditRequirement}
                onReview={handleReview}
                onMarkObsolete={obsoleteAction.open}
                onMarkImplemented={() => void implementAction.implement()}
            />

            <ReviewDecisionActionButtons
                canDecide={canDecideReview}
                onApprove={() => requestReviewDecision("approve")}
                onReject={() => requestReviewDecision("reject")}
            />

            <RequirementLifecycleDialog
                key={
                    obsoleteAction.visible
                        ? reviewActionRequirement?.requirementId
                        : "closed"
                }
                visible={obsoleteAction.visible}
                title="Mark requirement obsolete"
                reasonRequired
                pending={obsoleteAction.pending}
                onAbort={obsoleteAction.abort}
                onConfirm={obsoleteAction.confirm}
            />
        </section>
    );
}
