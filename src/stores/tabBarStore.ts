import { Store } from '@tanstack/react-store';

export type TabBarTab = Readonly<{ id: string; label: string; fixed?: boolean; closable?: boolean }>;

export type TabBarState = Readonly<{ openTabs: readonly TabBarTab[]; activeTabId: string | undefined }>;

const initialOpenTabs: readonly TabBarTab[] = [{ id: '/', label: 'Workspace', fixed: true, closable: false }];

export const tabBarStore = new Store<TabBarState>({ openTabs: initialOpenTabs, activeTabId: '/' });

export function resetTabBarStore(): void {
    tabBarStore.setState(() => ({ openTabs: initialOpenTabs, activeTabId: '/' }));
}

function getNextActiveTabId(
    openTabsBeforeClose: readonly TabBarTab[],
    remainingTabs: readonly TabBarTab[],
    closedTabId: string,
): string | undefined {
    const closedTabIndex = openTabsBeforeClose.findIndex((tab) => tab.id === closedTabId);

    const nextTabAtSamePosition = remainingTabs.at(closedTabIndex);

    if (nextTabAtSamePosition !== undefined) {
        return nextTabAtSamePosition.id;
    }

    const previousTab = closedTabIndex > 0 ? remainingTabs.at(closedTabIndex - 1) : undefined;

    if (previousTab !== undefined) {
        return previousTab.id;
    }

    return remainingTabs.at(0)?.id;
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

export function clearActiveTab(): void {
    tabBarStore.setState((state) => {
        if (state.activeTabId === undefined) {
            return state;
        }

        return { ...state, activeTabId: undefined };
    });
}

export function closeTab(tabId: string): TabBarTab | undefined {
    let nextActiveTab: TabBarTab | undefined;

    tabBarStore.setState((state) => {
        const tabToClose = state.openTabs.find((tab) => tab.id === tabId);

        if (tabToClose === undefined || tabToClose.closable === false) {
            return state;
        }

        const remainingTabs = state.openTabs.filter((tab) => tab.id !== tabId);
        const nextActiveTabId =
            state.activeTabId === tabId ? getNextActiveTabId(state.openTabs, remainingTabs, tabId) : state.activeTabId;

        nextActiveTab = remainingTabs.find((tab) => tab.id === nextActiveTabId);

        return { ...state, openTabs: remainingTabs, activeTabId: nextActiveTabId };
    });

    return nextActiveTab;
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
