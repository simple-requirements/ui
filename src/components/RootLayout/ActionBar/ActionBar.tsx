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
import { AccountMenu } from "@/components/RootLayout/AccountMenu/AccountMenu";
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

/**
 * Renders route-specific actions and the authenticated account menu.
 * @param onFindRequirementKey Optional callback used when a requirement key is submitted.
 * @returns Action bar for the active application route.
 */
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
        (configuration.showEditRequirement ?? false) &&
        permissions.canManageRequirements &&
        reviewActionRequirement !== undefined &&
        reviewActionRequirement.status !== "rejected";
    const canMarkObsolete =
        (configuration.showObsoleteRequirement ?? false) &&
        permissions.canManageRequirements &&
        canBecomeObsolete(reviewActionRequirement?.status);
    const canMarkImplemented =
        (configuration.showImplementedRequirement ?? false) &&
        permissions.canManageRequirements &&
        reviewActionRequirement?.status === "approved" &&
        (reviewActionRequirement.implementationTicketCount ?? 0) > 0;
    const canReview =
        (configuration.showReview ?? false) &&
        permissions.canManageRequirements &&
        isDraftRequirement;
    const canDecideReview =
        (configuration.showReviewDecisions ?? false) &&
        permissions.canManageRequirements &&
        isDraftRequirement;

    /**
     * Navigates to the configured create route for the active project.
     */
    function handleCreate(): void {
        if (
            projectId === undefined ||
            configuration.createActionKind === undefined
        ) {
            return;
        }

        void navigate(getCreateRoute(projectId, configuration.createActionKind));
    }

    /**
     * Opens the selected requirement in edit mode.
     */
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
            (configuration.showReviewDecisions ?? false)
                ? `${editRoute}?returnTo=review`
                : editRoute,
        );
    }

    /**
     * Opens the selected draft requirement in review mode.
     */
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

            <div className="action-bar__account">
                <AccountMenu />
            </div>

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
