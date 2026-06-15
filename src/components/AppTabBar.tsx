import { Button } from 'primereact/button';
import { WORKSPACE_TAB_ID, type Action, type RequirementTabState } from '@/state/workspaceReducer';

interface AppTabBarProps {
    activeAppTabId: string;
    openRequirementTabs: readonly RequirementTabState[];
    dispatch: (action: Action) => void;
}

export function AppTabBar({ activeAppTabId, openRequirementTabs, dispatch }: AppTabBarProps) {
    return (
        <div className="tabs" role="tablist" aria-label="Application tabs">
            <Button
                type="button"
                role="tab"
                aria-selected={activeAppTabId === WORKSPACE_TAB_ID}
                onClick={() => dispatch({ type: 'activateTab', tabId: WORKSPACE_TAB_ID })}
            >
                Workspace
            </Button>
            {openRequirementTabs.map((tab) => (
                <Button
                    type="button"
                    role="tab"
                    aria-selected={activeAppTabId === tab.id}
                    key={tab.id}
                    onClick={() => dispatch({ type: 'activateTab', tabId: tab.id })}
                    onKeyDown={(event) => {
                        if (event.key === 'Delete') {
                            dispatch({ type: 'closeTab', tabId: tab.id });
                        }
                    }}
                >
                    {tab.visibleKey}
                    <span
                        aria-label={`Close ${tab.visibleKey}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            dispatch({ type: 'closeTab', tabId: tab.id });
                        }}
                    >
                        {' '}
                        ×
                    </span>
                </Button>
            ))}
        </div>
    );
}
