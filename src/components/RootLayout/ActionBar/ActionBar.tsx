import { useSelector } from '@tanstack/react-store';
import { useNavigate, useParams } from 'react-router';

import '@/components/RootLayout/ActionBar/ActionBar.scss';

import { getActionBarAvailability } from '@/components/RootLayout/ActionBar/actionBarAvailability';
import {
    CategoryRouteActionButtons,
    CreateActionButton,
    RequirementRouteActionButtons,
    ReviewDecisionActionButtons,
} from '@/components/RootLayout/ActionBar/ActionBarButtons';
import { getActionBarConfiguration, getCreateRoute } from '@/components/RootLayout/ActionBar/actionBarConfiguration';
import { RequirementKeyLookup } from '@/components/RootLayout/ActionBar/RequirementKeyLookup';
import { AccountMenu } from '@/components/RootLayout/AccountMenu/AccountMenu';
import { useImplementRequirementAction } from '@/components/RootLayout/ActionBar/useImplementRequirementAction';
import { useObsoleteRequirementAction } from '@/components/RootLayout/ActionBar/useObsoleteRequirementAction';
import { useProjectPermissions } from '@/auth/projectPermissions';
import { RequirementLifecycleDialog } from '@/pages/ProjectRequirements/RequirementLifecycleDialog';
import {
    getProjectCategoryEditRoute,
    getProjectRequirementDetailsRoute,
    getProjectRequirementEditRoute,
    getProjectRequirementReviewRoute,
} from '@/router/projectRoutes';
import { useRouteUiMetadata } from '@/router/routeUiMetadata';
import { actionBarStore, openImplementationTicketsDialog, requestReviewDecision } from '@/stores/actionBarStore';
import { openTab } from '@/stores/tabBarStore';

export type ActionBarProps = Readonly<{ onFindRequirementKey?: (requirementKey: string) => void }>;

/**
 * Renders route-specific actions and the authenticated account menu.
 * @param onFindRequirementKey Optional callback used when a requirement key is submitted.
 * @returns Action bar for the active application route.
 */
export function ActionBar({ onFindRequirementKey }: ActionBarProps) {
    const navigate = useNavigate();
    const { projectId, categoryId } = useParams();
    const { actionBar: actionBarKind } = useRouteUiMetadata();
    const configuration = getActionBarConfiguration(actionBarKind);
    const permissions = useProjectPermissions(projectId);
    const reviewActionRequirement = useSelector(actionBarStore, (state) => state.reviewActionRequirement);
    const obsoleteAction = useObsoleteRequirementAction(reviewActionRequirement);
    const implementAction = useImplementRequirementAction(reviewActionRequirement);

    const availability = getActionBarAvailability(
        configuration,
        permissions,
        reviewActionRequirement,
        projectId,
        categoryId,
    );

    /**
     * Navigates to the configured create route for the active project.
     * @returns Nothing.
     */
    function handleCreate(): void {
        if (projectId === undefined || configuration.createActionKind === undefined) {
            return;
        }

        void navigate(getCreateRoute(projectId, configuration.createActionKind));
    }

    /**
     * Opens the selected requirement in edit mode.
     * @returns Nothing.
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
        openTab({ id: detailsRoute, label: reviewActionRequirement.visibleKey, closable: true });
        void navigate((configuration.showReviewDecisions ?? false) ? `${editRoute}?returnTo=review` : editRoute);
    }

    /**
     * Opens the active category in edit mode.
     * @returns Nothing.
     */
    function handleEditCategory(): void {
        if (projectId === undefined || categoryId === undefined) {
            return;
        }

        void navigate(getProjectCategoryEditRoute(projectId, categoryId));
    }

    /**
     * Opens the selected draft requirement in review mode.
     * @returns Nothing.
     */
    function handleReview(): void {
        if (reviewActionRequirement === undefined) {
            return;
        }
        void navigate(
            getProjectRequirementReviewRoute(reviewActionRequirement.projectId, reviewActionRequirement.requirementId),
        );
    }

    return (
        <section
            className='action-bar'
            aria-label={configuration.ariaLabel}>
            {configuration.showRequirementLookup && (
                <RequirementKeyLookup
                    disabled={configuration.disabled}
                    onFindKey={onFindRequirementKey}
                />
            )}

            {availability.showCreate && (
                <CreateActionButton
                    disabled={!availability.canCreate}
                    onCreate={handleCreate}
                />
            )}

            <CategoryRouteActionButtons
                canEdit={availability.canEditCategory}
                onEdit={handleEditCategory}
            />

            <RequirementRouteActionButtons
                canEdit={availability.canEditRequirement}
                canReview={availability.canReview}
                canManageTickets={availability.canManageTickets}
                canMarkObsolete={availability.canMarkObsolete}
                canMarkImplemented={availability.canMarkImplemented}
                implementPending={implementAction.pending}
                onEdit={handleEditRequirement}
                onReview={handleReview}
                onManageTickets={openImplementationTicketsDialog}
                onMarkObsolete={obsoleteAction.open}
                onMarkImplemented={() => void implementAction.implement()}
            />

            <ReviewDecisionActionButtons
                canDecide={availability.canDecideReview}
                onApprove={() => requestReviewDecision('approve')}
                onReject={() => requestReviewDecision('reject')}
            />

            <div className='action-bar__account'>
                <AccountMenu />
            </div>

            <RequirementLifecycleDialog
                key={obsoleteAction.visible ? reviewActionRequirement?.requirementId : 'closed'}
                visible={obsoleteAction.visible}
                title='Mark requirement obsolete'
                reasonRequired
                pending={obsoleteAction.pending}
                onAbort={obsoleteAction.abort}
                onConfirm={obsoleteAction.confirm}
            />
        </section>
    );
}
