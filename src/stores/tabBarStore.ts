import { Store } from '@tanstack/react-store';

export type TabBarTab = Readonly<{ id: string; label: string; fixed?: boolean; closable?: boolean }>;

export type TabBarState = Readonly<{ openTabs: readonly TabBarTab[]; activeTabId: string | undefined }>;

const initialOpenTabs: readonly TabBarTab[] = [
    { id: 'workspace', label: 'Workspace', fixed: true, closable: false },
    { id: 'project-overview', label: 'Project overview', closable: true },
    { id: 'nfr-usab-0043', label: 'NFR-USAB-0043', closable: true },
];

export const tabBarStore = new Store<TabBarState>({ openTabs: initialOpenTabs, activeTabId: 'workspace' });

function getNextActiveTabId(
    openTabsBeforeClose: readonly TabBarTab[],
    remainingTabs: readonly TabBarTab[],
    closedTabId: string,
): string | undefined {
    const closedTabIndex = openTabsBeforeClose.findIndex((tab) => tab.id === closedTabId);

    if (closedTabIndex < remainingTabs.length) {
        return remainingTabs[closedTabIndex].id;
    }

    if (closedTabIndex > 0) {
        return remainingTabs[closedTabIndex - 1].id;
    }

    if (remainingTabs.length > 0) {
        return remainingTabs[0].id;
    }

    return undefined;
}

export function activateTab(tabId: string): void {
    tabBarStore.setState((state) => {
        const tabExists = state.openTabs.some((tab) => tab.id === tabId);

        if (!tabExists) {
            return state;
        }

        return { ...state, activeTabId: tabId };
    });
}

export function closeTab(tabId: string): void {
    tabBarStore.setState((state) => {
        const tabToClose = state.openTabs.find((tab) => tab.id === tabId);

        if (tabToClose === undefined || tabToClose.closable === false) {
            return state;
        }

        const remainingTabs = state.openTabs.filter((tab) => tab.id !== tabId);

        return {
            ...state,
            openTabs: remainingTabs,
            activeTabId:
                state.activeTabId === tabId ?
                    getNextActiveTabId(state.openTabs, remainingTabs, tabId)
                :   state.activeTabId,
        };
    });
}

export function openTab(tab: TabBarTab): void {
    tabBarStore.setState((state) => {
        const tabExists = state.openTabs.some((openTabItem) => openTabItem.id === tab.id);

        if (tabExists) {
            return { ...state, activeTabId: tab.id };
        }

        return {
            ...state,
            openTabs: [...state.openTabs, { ...tab, closable: tab.closable ?? true }],
            activeTabId: tab.id,
        };
    });
}
