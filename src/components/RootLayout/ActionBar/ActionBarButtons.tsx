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
            pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
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
                    pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
                />
            )}

            {canReview && (
                <Button
                    type='button'
                    label='Review'
                    onClick={onReview}
                    pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
                />
            )}

            {canManageTickets && (
                <Button
                    type='button'
                    label='Tickets'
                    onClick={onManageTickets}
                    pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
                />
            )}

            {canMarkObsolete && (
                <Button
                    type='button'
                    label='Obsolete'
                    onClick={onMarkObsolete}
                    pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
                />
            )}

            {canMarkImplemented && (
                <Button
                    type='button'
                    label='Implemented'
                    loading={implementPending}
                    onClick={onMarkImplemented}
                    pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
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
                pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
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
                pt={{ root: { className: 'ui-button ui-button--primary ui-button--action' } }}
                onClick={onApprove}
            />
            <Button
                type='button'
                label='Reject'
                severity='danger'
                pt={{ root: { className: 'ui-button ui-button--danger ui-button--action' } }}
                onClick={onReject}
            />
        </>
    );
}

export type AdministratorUserActionButtonsProps = Readonly<{
    label?: 'Activate account' | 'Deactivate account';
    disabled: boolean;
    onToggleStatus: () => void;
}>;

/** Renders account-state administration in the shared ActionBar. */
export function AdministratorUserActionButtons({
    label,
    disabled,
    onToggleStatus,
}: AdministratorUserActionButtonsProps) {
    if (label === undefined) return null;

    return (
        <Button
            type='button'
            label={label}
            severity={label === 'Deactivate account' ? 'danger' : undefined}
            disabled={disabled}
            onClick={onToggleStatus}
            pt={{
                root: {
                    className:
                        label === 'Deactivate account' ?
                            'ui-button ui-button--danger ui-button--action'
                        :   'ui-button ui-button--outline ui-button--action',
                },
            }}
        />
    );
}

export type AdministratorProjectActionButtonsProps = Readonly<{
    selected: boolean;
    disabled: boolean;
    addMembershipDisabled: boolean;
    deleteDisabled: boolean;
    onCreate: () => void;
    onRename: () => void;
    onDelete: () => void;
    onAddMembership: () => void;
}>;

/** Renders project administration actions in the shared ActionBar. */
export function AdministratorProjectActionButtons({
    selected,
    disabled,
    addMembershipDisabled,
    deleteDisabled,
    onCreate,
    onRename,
    onDelete,
    onAddMembership,
}: AdministratorProjectActionButtonsProps) {
    if (!selected) {
        return (
            <Button
                type='button'
                label='New project'
                icon='pi pi-plus'
                disabled={disabled}
                onClick={onCreate}
                pt={{ root: { className: 'ui-button ui-button--outline ui-button--action ui-button--with-icon' } }}
            />
        );
    }

    return (
        <>
            <Button
                type='button'
                label='Rename project'
                disabled={disabled}
                onClick={onRename}
                pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
            />
            <Button
                type='button'
                label='Add membership'
                icon='pi pi-user-plus'
                disabled={disabled || addMembershipDisabled}
                onClick={onAddMembership}
                pt={{ root: { className: 'ui-button ui-button--outline ui-button--action ui-button--with-icon' } }}
            />
            <Button
                type='button'
                label='Delete project'
                severity='danger'
                disabled={disabled || deleteDisabled}
                title={deleteDisabled ? 'Projects containing requirements cannot be deleted.' : undefined}
                onClick={onDelete}
                pt={{ root: { className: 'ui-button ui-button--danger ui-button--action' } }}
            />
        </>
    );
}
