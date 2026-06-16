import { Button } from 'primereact/button';
import { WORKSPACE_TAB_ID, type Action, type RequirementTabState } from '@/state/workspaceReducer';

type AppTabBarProps = Readonly<{
    activeAppTabId: string;
    openRequirementTabs: readonly RequirementTabState[];
    dispatch: (action: Action) => void;
}>;

export function AppTabBar({ activeAppTabId, openRequirementTabs, dispatch }: AppTabBarProps) {
    const handleActivateWorkspace = () => dispatch({ type: 'activateTab', tabId: WORKSPACE_TAB_ID });
    const handleActivateTab = (tabId: string) => dispatch({ type: 'activateTab', tabId });
    const handleCloseTab = (tabId: string) => dispatch({ type: 'closeTab', tabId });

    const renderWorkspaceTab = () => (
        <Button
            type="button"
            role="tab"
            className="app-tabs__tab app-tabs__tab--workspace"
            aria-selected={activeAppTabId === WORKSPACE_TAB_ID}
            onClick={handleActivateWorkspace}
        >
            Workspace
        </Button>
    );

    const renderRequirementTab = (tab: RequirementTabState) => (
        <Button
            type="button"
            role="tab"
            className="app-tabs__tab app-tabs__tab--requirement"
            aria-selected={activeAppTabId === tab.id}
            key={tab.id}
            onClick={() => handleActivateTab(tab.id)}
            onKeyDown={(event) => {
                if (event.key === 'Delete') {
                    handleCloseTab(tab.id);
                }
            }}
        >
            {tab.visibleKey}
            <span
                className="app-tabs__close"
                aria-label={`Close ${tab.visibleKey}`}
                onClick={(event) => {
                    event.stopPropagation();
                    handleCloseTab(tab.id);
                }}
            >
                {' '}
                ×
            </span>
        </Button>
    );

    return (
        <div className="app-tabs tabs" role="tablist" aria-label="Application tabs">
            {renderWorkspaceTab()}
            {openRequirementTabs.map(renderRequirementTab)}
        </div>
    );
}
