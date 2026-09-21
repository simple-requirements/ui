import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TabBar } from '@/components/RootLayout/TabBar/TabBar';
import { tabBarStore } from '@/stores/tabBarStore';
import type * as TabBarStoreModule from '@/stores/tabBarStore';

type TestTabBarTab = Readonly<{ id: string; label: string; fixed?: boolean; closable?: boolean }>;

type TestTabBarState = Readonly<{ openTabs: readonly TestTabBarTab[]; activeTabId: string | undefined }>;

const mocks = vi.hoisted(() => ({ activateTab: vi.fn(), clearActiveTab: vi.fn(), closeTab: vi.fn() }));

vi.mock('@/stores/tabBarStore', async (importOriginal) => {
    const actual = await importOriginal<typeof TabBarStoreModule>();

    return {
        ...actual,
        activateTab: (tabId: string): void => {
            mocks.activateTab(tabId);
            actual.activateTab(tabId);
        },
        clearActiveTab: (): void => {
            mocks.clearActiveTab();
            actual.clearActiveTab();
        },
        closeTab: (tabId: string): TabBarStoreModule.TabBarTab | undefined => {
            mocks.closeTab(tabId);

            return actual.closeTab(tabId);
        },
    };
});

function createDefaultOpenTabs(): readonly TestTabBarTab[] {
    return [
        { id: '/', label: 'Workspace', fixed: true, closable: false },
        { id: '/projects/project-alpha', label: 'Alpha overview', closable: true },
        { id: '/projects/project-beta', label: 'Beta overview', closable: true },
    ];
}

function setMockTabBarState(state: TestTabBarState): void {
    tabBarStore.setState(() => state);
}

function LocationProbe() {
    const location = useLocation();

    return <output aria-label='Current route'>{location.pathname}</output>;
}

function renderTabBar(initialEntry = '/'): ReturnType<typeof render> {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <TabBar />
            <LocationProbe />
        </MemoryRouter>,
    );
}

beforeEach(() => {
    setMockTabBarState({ openTabs: createDefaultOpenTabs(), activeTabId: '/' });

    mocks.activateTab.mockClear();
    mocks.clearActiveTab.mockClear();
    mocks.closeTab.mockClear();
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('TabBar', () => {
    it('renders the workspace tabs navigation.', () => {
        renderTabBar();

        expect(screen.getByRole('navigation', { name: /workspace tabs/i })).toBeInTheDocument();
    });

    it('navigates when a route-backed tab is clicked.', async () => {
        const user = userEvent.setup();

        renderTabBar();

        await user.click(screen.getByRole('button', { name: /^alpha overview$/i }));

        await waitFor(() => {
            expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-alpha');
        });

        expect(mocks.activateTab).toHaveBeenCalledWith('/projects/project-alpha');
        expect(screen.getByRole('button', { name: /^alpha overview$/i })).toHaveAttribute('aria-current', 'page');
    });

    it('navigates back to the category list when the active category details tab is closed.', async () => {
        const user = userEvent.setup();
        const categoryDetailsRoute = '/projects/project-alpha/categories/category-auth';

        setMockTabBarState({
            openTabs: [
                { id: '/', label: 'Workspace', fixed: true, closable: false },
                { id: '/projects/project-alpha/categories', label: 'Categories', closable: true },
                { id: categoryDetailsRoute, label: 'Category AUTH', closable: true },
            ],
            activeTabId: categoryDetailsRoute,
        });

        renderTabBar(categoryDetailsRoute);

        await user.click(screen.getByRole('button', { name: /^close category auth tab$/i }));

        await waitFor(() => {
            expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-alpha/categories');
        });

        expect(mocks.closeTab).toHaveBeenCalledWith(categoryDetailsRoute);
        expect(mocks.clearActiveTab).toHaveBeenCalledTimes(1);
    });

    it('does not navigate when an inactive tab is closed.', async () => {
        const user = userEvent.setup();

        setMockTabBarState({ openTabs: createDefaultOpenTabs(), activeTabId: '/projects/project-beta' });

        renderTabBar('/projects/project-beta');

        await user.click(screen.getByRole('button', { name: /^close alpha overview tab$/i }));

        expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-beta');
        expect(mocks.closeTab).toHaveBeenCalledWith('/projects/project-alpha');
    });

    it('navigates to the next route-backed tab when the active tab is closed.', async () => {
        const user = userEvent.setup();

        setMockTabBarState({ openTabs: createDefaultOpenTabs(), activeTabId: '/projects/project-alpha' });

        renderTabBar('/projects/project-alpha');

        await user.click(screen.getByRole('button', { name: /^close alpha overview tab$/i }));

        await waitFor(() => {
            expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-beta');
        });

        expect(screen.queryByRole('button', { name: /^alpha overview$/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^beta overview$/i })).toHaveAttribute('aria-current', 'page');
    });
});
