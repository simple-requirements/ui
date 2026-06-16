import { Button } from 'primereact/button';
import type { DemoRequirement } from '@/demo/demoTypes';
import { lifecycleActions } from '@/features/requirements/requirementActions';
import type { Action } from '@/state/workspaceReducer';

type ActionBarProps = Readonly<{
    activeProjectId: string | null;
    selectedRequirement: DemoRequirement | null;
    dedicated?: boolean;
    dispatch: (action: Action) => void;
    onTransition: (actionLabel: string) => void;
    onDeleteDraft: () => void;
}>;

/** Renders context-sensitive requirement actions for workspace and dedicated requirement views. */
export function ActionBar({
    activeProjectId,
    selectedRequirement,
    dedicated = false,
    dispatch,
    onTransition,
    onDeleteDraft,
}: ActionBarProps) {
    const handleNewRequirement = () => dispatch({ type: 'setMode', mode: 'newRequirement' });

    const handleOpenInTab = () => {
        if (!selectedRequirement) {
            return;
        }

        dispatch({
            type: 'openRequirementTab',
            requirementId: selectedRequirement.id,
            visibleKey: selectedRequirement.visibleKey,
        });
    };

    const handleCopyVisibleKey = () => {
        if (selectedRequirement) {
            void navigator.clipboard.writeText(selectedRequirement.visibleKey);
        }
    };

    const renderOpenInTabButton = () => {
        if (dedicated || !selectedRequirement) {
            return null;
        }

        return (
            <Button
                type='button'
                aria-label='Open in tab'
                onClick={handleOpenInTab}>
                Open in tab
            </Button>
        );
    };

    const renderRequirementActions = () => {
        if (!selectedRequirement) {
            return null;
        }

        return (
            <>
                <Button type='button'>History</Button>
                {renderOpenInTabButton()}
                {lifecycleActions(selectedRequirement.status).map((actionLabel) => (
                    <Button
                        type='button'
                        key={actionLabel}
                        onClick={() => onTransition(actionLabel)}>
                        {actionLabel}
                    </Button>
                ))}
                <Button
                    type='button'
                    onClick={handleCopyVisibleKey}>
                    Copy visible key
                </Button>
                {selectedRequirement.status === 'draft' ?
                    <Button
                        type='button'
                        className='actionbar__button--danger danger'
                        onClick={onDeleteDraft}>
                        Delete draft
                    </Button>
                :   null}
            </>
        );
    };

    return (
        <div className='workspace-actionbar actionbar'>
            <Button
                type='button'
                onClick={handleNewRequirement}
                disabled={!activeProjectId}>
                New requirement
            </Button>
            {renderRequirementActions()}
        </div>
    );
}
