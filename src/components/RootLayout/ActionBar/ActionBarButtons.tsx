import { Button } from "primereact/button";

export type CreateActionButtonProps = Readonly<{
    disabled: boolean;
    onCreate: () => void;
}>;

export function CreateActionButton({
    disabled,
    onCreate,
}: CreateActionButtonProps) {
    return (
        <Button
            type="button"
            label="Create"
            disabled={disabled}
            onClick={onCreate}
            pt={{ root: { className: "action-bar__button" } }}
        />
    );
}

export type RequirementRouteActionButtonsProps = Readonly<{
    canEdit: boolean;
    canReview: boolean;
    canMarkObsolete: boolean;
    canMarkImplemented: boolean;
    implementPending: boolean;
    onEdit: () => void;
    onReview: () => void;
    onMarkObsolete: () => void;
    onMarkImplemented: () => void;
}>;

export function RequirementRouteActionButtons({
    canEdit,
    canReview,
    canMarkObsolete,
    canMarkImplemented,
    implementPending,
    onEdit,
    onReview,
    onMarkObsolete,
    onMarkImplemented,
}: RequirementRouteActionButtonsProps) {
    return (
        <>
            {canEdit && (
                <Button
                    type="button"
                    label="Edit"
                    onClick={onEdit}
                    pt={{ root: { className: "action-bar__button" } }}
                />
            )}

            {canReview && (
                <Button
                    type="button"
                    label="Review"
                    onClick={onReview}
                    pt={{ root: { className: "action-bar__button" } }}
                />
            )}

            {canMarkObsolete && (
                <Button
                    type="button"
                    label="Obsolete"
                    onClick={onMarkObsolete}
                    pt={{ root: { className: "action-bar__button" } }}
                />
            )}

            {canMarkImplemented && (
                <Button
                    type="button"
                    label="Implemented"
                    loading={implementPending}
                    onClick={onMarkImplemented}
                    pt={{ root: { className: "action-bar__button" } }}
                />
            )}
        </>
    );
}

export type ReviewDecisionActionButtonsProps = Readonly<{
    canDecide: boolean;
    onApprove: () => void;
    onReject: () => void;
}>;

export function ReviewDecisionActionButtons({
    canDecide,
    onApprove,
    onReject,
}: ReviewDecisionActionButtonsProps) {
    if (!canDecide) {
        return null;
    }

    return (
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
                onClick={onApprove}
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
                onClick={onReject}
            />
        </>
    );
}
