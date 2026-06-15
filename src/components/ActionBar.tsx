import type { DemoRequirement } from '@/demo/demoTypes';
import { lifecycleActions } from '@/features/requirements/requirementActions';
import type { Action } from '@/state/workspaceReducer';

interface ActionBarProps {
    activeProjectId: string | null;
    selectedRequirement: DemoRequirement | null;
    dedicated?: boolean;
    dispatch: (action: Action) => void;
    onTransition: (actionLabel: string) => void;
    onDeleteDraft: () => void;
}

export function ActionBar({
    activeProjectId,
    selectedRequirement,
    dedicated = false,
    dispatch,
    onTransition,
    onDeleteDraft,
}: ActionBarProps) {
    return (
        <div className="actionbar">
            <button onClick={() => dispatch({ type: 'setMode', mode: 'newRequirement' })} disabled={!activeProjectId}>
                New requirement
            </button>
            {selectedRequirement ? (
                <>
                    <button>History</button>
                    {!dedicated ? (
                        <button
                            aria-label="Open in tab"
                            onClick={() =>
                                dispatch({
                                    type: 'openRequirementTab',
                                    requirementId: selectedRequirement.id,
                                    visibleKey: selectedRequirement.visibleKey,
                                })
                            }
                        >
                            Open in tab
                        </button>
                    ) : null}
                    {lifecycleActions(selectedRequirement.status).map((actionLabel) => (
                        <button key={actionLabel} onClick={() => onTransition(actionLabel)}>
                            {actionLabel}
                        </button>
                    ))}
                    <button onClick={() => void navigator.clipboard.writeText(selectedRequirement.visibleKey)}>
                        Copy visible key
                    </button>
                    {selectedRequirement.status === 'draft' ? (
                        <button className="danger" onClick={onDeleteDraft}>
                            Delete draft
                        </button>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}
