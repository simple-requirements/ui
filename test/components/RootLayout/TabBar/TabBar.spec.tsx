import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TabBar } from '@/components/RootLayout/TabBar/TabBar';
import { tabBarStore } from '@/stores/tabBarStore';
import type * as TabBarStoreModule from '@/stores/tabBarStore';

type TestTabBarTab = Readonly<{ id: string; label: string; fixed?: boolean; closable?: boolean }>;

type TestTabBarState = Readonly<{ openTabs: readonly TestTabBarTab[]; activeTabId: string | undefined }>;

const mocks = vi.hoisted(() => ({ activateTab: vi.fn(), closeTab: vi.fn() }));

vi.mock('@/stores/tabBarStore', async (importOriginal) => {
    const actual = await importOriginal<typeof TabBarStoreModule>();

    return {
        ...actual,
        activateTab: (tabId: string): void => {
            mocks.activateTab(tabId);
            actual.activateTab(tabId);
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
        { id: '/projects/project-alpha', label: 'Project overview', closable: true },
        { id: '/requirements/nfr-usab-0043', label: 'NFR-USAB-0043', closable: true },
    ];
}

function setMockTabBarState(state: TestTabBarState): void {
    tabBarStore.setState(() => state);
}

function renderTabBar(): ReturnType<typeof render> {
    return render(
        <MemoryRouter>
            <TabBar />
        </MemoryRouter>,
    );
}

beforeEach(() => {
    setMockTabBarState({ openTabs: createDefaultOpenTabs(), activeTabId: '/' });

    mocks.activateTab.mockClear();
    mocks.closeTab.mockClear();
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('TabBar', () => {
    describe('renders', () => {
        it('the workspace tabs navigation.', () => {
            renderTabBar();

            expect(screen.getByRole('navigation', { name: /workspace tabs/i })).toBeInTheDocument();
        });

        it('renders tabs in the store order.', () => {
            renderTabBar();

            const navigation = screen.getByRole('navigation', { name: /workspace tabs/i });
            const tabGroups = within(navigation).getAllByRole('group');

            const tabLabels = tabGroups.map((tabGroup) => {
                const selectButton = within(tabGroup).getAllByRole('button')[0];

                return selectButton.textContent.trim();
            });

            expect(tabLabels).toEqual(['Workspace', 'Project overview', 'NFR-USAB-0043']);
        });

        it('does not render a close button for the static Workspace tab.', () => {
            renderTabBar();

            expect(screen.queryByRole('button', { name: /^close workspace tab$/i })).not.toBeInTheDocument();
        });

        it('close buttons for closable tabs.', () => {
            renderTabBar();

            expect(screen.getByRole('button', { name: /^close project overview tab$/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /^close nfr-usab-0043 tab$/i })).toBeInTheDocument();
        });
    });

    describe('marks', () => {
        it('the active tab from the store.', () => {
            setMockTabBarState({ openTabs: createDefaultOpenTabs(), activeTabId: '/projects/project-alpha' });

            renderTabBar();

            const projectOverviewGroup = screen.getByRole('group', { name: /project overview tab/i });
            const projectOverviewButton = screen.getByRole('button', { name: /^project overview$/i });

            expect(projectOverviewGroup).toHaveClass('tab--active');
            expect(projectOverviewButton).toHaveAttribute('aria-current', 'page');

            expect(screen.getByRole('group', { name: /workspace tab/i })).not.toHaveClass('tab--active');
            expect(screen.getByRole('button', { name: /^workspace$/i })).not.toHaveAttribute('aria-current');
        });

        it('fixed tabs from the store.', () => {
            renderTabBar();

            expect(screen.getByRole('group', { name: /workspace tab/i })).toHaveClass('tab--fixed');
            expect(screen.getByRole('group', { name: /project overview tab/i })).not.toHaveClass('tab--fixed');
        });
    });

    describe('calls', () => {
        it('calls activateTab when a tab is clicked.', async () => {
            const user = userEvent.setup();

            renderTabBar();

            await user.click(screen.getByRole('button', { name: /^project overview$/i }));

            expect(mocks.activateTab).toHaveBeenCalledTimes(1);
            expect(mocks.activateTab).toHaveBeenCalledWith('/projects/project-alpha');
        });

        it('calls closeTab when a close button is clicked.', async () => {
            const user = userEvent.setup();

            renderTabBar();

            await user.click(screen.getByRole('button', { name: /^close project overview tab$/i }));

            expect(mocks.closeTab).toHaveBeenCalledTimes(1);
            expect(mocks.closeTab).toHaveBeenCalledWith('/projects/project-alpha');
        });
    });

    it('updates the active tab after a tab select button is clicked.', async () => {
        const user = userEvent.setup();

        renderTabBar();

        await user.click(screen.getByRole('button', { name: /^project overview$/i }));

        await waitFor(() => {
            expect(screen.getByRole('group', { name: /project overview tab/i })).toHaveClass('tab--active');
        });

        expect(screen.getByRole('button', { name: /^project overview$/i })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('button', { name: /^workspace$/i })).not.toHaveAttribute('aria-current');
    });

    it('removes a closable tab after its close button is clicked.', async () => {
        const user = userEvent.setup();

        renderTabBar();

        await user.click(screen.getByRole('button', { name: /^close project overview tab$/i }));

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /^project overview$/i })).not.toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /^close project overview tab$/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^workspace$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^nfr-usab-0043$/i })).toBeInTheDocument();
    });
});
