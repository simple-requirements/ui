import { Button } from 'primereact/button';

export type CreateActionButtonProps = Readonly<{ disabled: boolean; onCreate: () => void }>;

/**
 * Renders the route create action.
 * @param disabled Whether creation is currently unavailable.
 * @param onCreate Callback invoked for creation.
 * @returns Create action button.
 */
export function CreateActionButton({ disabled, onCreate }: CreateActionButtonProps) {
    return (
        <Button
            type='button'
            label='Create'
            disabled={disabled}
            onClick={onCreate}
            pt={{ root: { className: 'action-bar__button' } }}
        />
    );
}

export type RequirementRouteActionButtonsProps = Readonly<{
    canEdit: boolean;
    canReview: boolean;
    canManageTickets: boolean;
    canMarkObsolete: boolean;
    canMarkImplemented: boolean;
    implementPending: boolean;
    onEdit: () => void;
    onReview: () => void;
    onManageTickets: () => void;
    onMarkObsolete: () => void;
    onMarkImplemented: () => void;
}>;

/**
 * Renders requirement-specific action buttons for details and review routes.
 * @param props Requirement action visibility and callbacks.
 * @returns Requirement action buttons.
 */
export function RequirementRouteActionButtons({
    canEdit,
    canReview,
    canManageTickets,
    canMarkObsolete,
    canMarkImplemented,
    implementPending,
    onEdit,
    onReview,
    onManageTickets,
    onMarkObsolete,
    onMarkImplemented,
}: RequirementRouteActionButtonsProps) {
    return (
        <>
            {canEdit && (
                <Button
                    type='button'
                    label='Edit'
                    onClick={onEdit}
                    pt={{ root: { className: 'action-bar__button' } }}
                />
            )}

            {canReview && (
                <Button
                    type='button'
                    label='Review'
                    onClick={onReview}
                    pt={{ root: { className: 'action-bar__button' } }}
                />
            )}

            {canManageTickets && (
                <Button
                    type='button'
                    label='Tickets'
                    onClick={onManageTickets}
                    pt={{ root: { className: 'action-bar__button' } }}
                />
            )}

            {canMarkObsolete && (
                <Button
                    type='button'
                    label='Obsolete'
                    onClick={onMarkObsolete}
                    pt={{ root: { className: 'action-bar__button' } }}
                />
            )}

            {canMarkImplemented && (
                <Button
                    type='button'
                    label='Implemented'
                    loading={implementPending}
                    onClick={onMarkImplemented}
                    pt={{ root: { className: 'action-bar__button' } }}
                />
            )}
        </>
    );
}

export type CategoryRouteActionButtonsProps = Readonly<{ canEdit: boolean; onEdit: () => void }>;

/**
 * Renders category-specific route actions.
 * @param canEdit Whether category editing is available.
 * @param onEdit Callback used to open category edit mode.
 * @returns Category route action buttons.
 */
export function CategoryRouteActionButtons({ canEdit, onEdit }: CategoryRouteActionButtonsProps) {
    return canEdit ?
            <Button
                type='button'
                label='Edit'
                onClick={onEdit}
                pt={{ root: { className: 'action-bar__button' } }}
            />
        :   null;
}

export type ReviewDecisionActionButtonsProps = Readonly<{
    canDecide: boolean;
    onApprove: () => void;
    onReject: () => void;
}>;

/**
 * Renders review approval and rejection actions when a decision is allowed.
 * @param canDecide Whether review decisions are available.
 * @param onApprove Callback invoked for approval.
 * @param onReject Callback invoked for rejection.
 * @returns Review decision buttons or null.
 */
export function ReviewDecisionActionButtons({ canDecide, onApprove, onReject }: ReviewDecisionActionButtonsProps) {
    if (!canDecide) {
        return null;
    }

    return (
        <>
            <Button
                type='button'
                label='Approve'
                pt={{ root: { className: 'action-bar__decision-button action-bar__decision-button--approve' } }}
                onClick={onApprove}
            />
            <Button
                type='button'
                label='Reject'
                severity='danger'
                pt={{ root: { className: 'action-bar__decision-button action-bar__decision-button--reject' } }}
                onClick={onReject}
            />
        </>
    );
}
