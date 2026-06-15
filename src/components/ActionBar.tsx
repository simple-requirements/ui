import { Button } from 'primereact/button';
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
            <Button type="button" onClick={() => dispatch({ type: 'setMode', mode: 'newRequirement' })} disabled={!activeProjectId}>
                New requirement
            </Button>
            {selectedRequirement ? (
                <>
                    <Button type="button">History</Button>
                    {!dedicated ? (
                        <Button
                            type="button"
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
                        </Button>
                    ) : null}
                    {lifecycleActions(selectedRequirement.status).map((actionLabel) => (
                        <Button type="button" key={actionLabel} onClick={() => onTransition(actionLabel)}>
                            {actionLabel}
                        </Button>
                    ))}
                    <Button type="button" onClick={() => void navigator.clipboard.writeText(selectedRequirement.visibleKey)}>
                        Copy visible key
                    </Button>
                    {selectedRequirement.status === 'draft' ? (
                        <Button type="button" className="danger" onClick={onDeleteDraft}>
                            Delete draft
                        </Button>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}
