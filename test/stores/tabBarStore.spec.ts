import { afterEach, describe, expect, it } from 'vitest';

import { activateTab, clearActiveTab, closeTab, openTab, tabBarStore, type TabBarState } from '@/stores/tabBarStore';

const initialState: TabBarState = {
    openTabs: [{ id: '/', label: 'Workspace', fixed: true, closable: false }],
    activeTabId: '/',
};

function setTabBarState(state: TabBarState): void {
    tabBarStore.setState(() => state);
}

afterEach(() => {
    setTabBarState(initialState);
});

describe('tabBarStore', () => {
    it('opens a new tab and activates it.', () => {
        openTab({ id: '/projects/project-alpha/categories/category-auth', label: 'Category AUTH' });

        expect(tabBarStore.state.openTabs).toEqual([
            { id: '/', label: 'Workspace', fixed: true, closable: false },
            { id: '/projects/project-alpha/categories/category-auth', label: 'Category AUTH', closable: true },
        ]);
        expect(tabBarStore.state.activeTabId).toBe('/projects/project-alpha/categories/category-auth');
    });

    it('activates an existing tab instead of adding it twice.', () => {
        setTabBarState({
            openTabs: [
                { id: '/', label: 'Workspace', fixed: true, closable: false },
                { id: '/projects/project-alpha', label: 'Project Alpha', closable: true },
            ],
            activeTabId: '/',
        });

        openTab({ id: '/projects/project-alpha', label: 'Project Alpha' });

        expect(tabBarStore.state.openTabs).toHaveLength(2);
        expect(tabBarStore.state.activeTabId).toBe('/projects/project-alpha');
    });

    it('does not activate a missing tab.', () => {
        activateTab('/missing');

        expect(tabBarStore.state.activeTabId).toBe('/');
    });

    it('closes the active tab and activates the tab at the same position.', () => {
        setTabBarState({
            openTabs: [
                { id: '/', label: 'Workspace', fixed: true, closable: false },
                { id: '/projects/a', label: 'A', closable: true },
                { id: '/projects/b', label: 'B', closable: true },
            ],
            activeTabId: '/projects/a',
        });

        const nextTab = closeTab('/projects/a');

        expect(nextTab).toEqual({ id: '/projects/b', label: 'B', closable: true });
        expect(tabBarStore.state.activeTabId).toBe('/projects/b');
    });

    it('does not close non-closable tabs.', () => {
        const nextTab = closeTab('/');

        expect(nextTab).toBeUndefined();
        expect(tabBarStore.state.openTabs).toEqual(initialState.openTabs);
        expect(tabBarStore.state.activeTabId).toBe('/');
    });

    it('clears the active tab.', () => {
        clearActiveTab();

        expect(tabBarStore.state.activeTabId).toBeUndefined();
    });
});
