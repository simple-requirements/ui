import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
        closeTab: (tabId: string): void => {
            mocks.closeTab(tabId);
            actual.closeTab(tabId);
        },
    };
});

function createDefaultOpenTabs(): readonly TestTabBarTab[] {
    return [
        { id: 'workspace', label: 'Workspace', fixed: true, closable: false },
        { id: 'project-overview', label: 'Project overview', closable: true },
        { id: 'nfr-usab-0043', label: 'NFR-USAB-0043', closable: true },
    ];
}

function setMockTabBarState(state: TestTabBarState): void {
    tabBarStore.setState(() => state);
}

beforeEach(() => {
    setMockTabBarState({ openTabs: createDefaultOpenTabs(), activeTabId: 'workspace' });

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
            render(<TabBar />);

            expect(screen.getByRole('navigation', { name: /workspace tabs/i })).toBeInTheDocument();
        });

        it('renders tabs in the store order.', () => {
            render(<TabBar />);

            const navigation = screen.getByRole('navigation', { name: /workspace tabs/i });
            const tabGroups = within(navigation).getAllByRole('group');

            const tabLabels = tabGroups.map((tabGroup) => {
                const selectButton = within(tabGroup).getAllByRole('button')[0];

                return selectButton.textContent.trim();
            });

            expect(tabLabels).toEqual(['Workspace', 'Project overview', 'NFR-USAB-0043']);
        });

        it('does not render a close button for the static Workspace tab.', () => {
            render(<TabBar />);

            expect(screen.queryByRole('button', { name: /^close workspace tab$/i })).not.toBeInTheDocument();
        });

        it('close buttons for closable tabs.', () => {
            render(<TabBar />);

            expect(screen.getByRole('button', { name: /^close project overview tab$/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /^close nfr-usab-0043 tab$/i })).toBeInTheDocument();
        });
    });

    describe('marks', () => {
        it('the active tab from the store.', () => {
            setMockTabBarState({ openTabs: createDefaultOpenTabs(), activeTabId: 'project-overview' });

            render(<TabBar />);

            const projectOverviewGroup = screen.getByRole('group', { name: /project overview tab/i });
            const projectOverviewButton = screen.getByRole('button', { name: /^project overview$/i });

            expect(projectOverviewGroup).toHaveClass('tab--active');
            expect(projectOverviewButton).toHaveAttribute('aria-current', 'page');

            expect(screen.getByRole('group', { name: /workspace tab/i })).not.toHaveClass('tab--active');
            expect(screen.getByRole('button', { name: /^workspace$/i })).not.toHaveAttribute('aria-current');
        });

        it('fixed tabs from the store.', () => {
            render(<TabBar />);

            expect(screen.getByRole('group', { name: /workspace tab/i })).toHaveClass('tab--fixed');
            expect(screen.getByRole('group', { name: /project overview tab/i })).not.toHaveClass('tab--fixed');
        });
    });

    describe('calls', () => {
        it('calls activateTab when a tab is clicked.', async () => {
            const user = userEvent.setup();

            render(<TabBar />);

            await user.click(screen.getByRole('button', { name: /^project overview$/i }));

            expect(mocks.activateTab).toHaveBeenCalledTimes(1);
            expect(mocks.activateTab).toHaveBeenCalledWith('project-overview');
        });
        
        it('calls closeTab when a close button is clicked.', async () => {
            const user = userEvent.setup();

            render(<TabBar />);

            await user.click(screen.getByRole('button', { name: /^close project overview tab$/i }));

            expect(mocks.closeTab).toHaveBeenCalledTimes(1);
            expect(mocks.closeTab).toHaveBeenCalledWith('project-overview');
        });
    });

    it('updates the active tab after a tab select button is clicked.', async () => {
        const user = userEvent.setup();

        render(<TabBar />);

        await user.click(screen.getByRole('button', { name: /^project overview$/i }));

        await waitFor(() => {
            expect(screen.getByRole('group', { name: /project overview tab/i })).toHaveClass('tab--active');
        });

        expect(screen.getByRole('button', { name: /^project overview$/i })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('button', { name: /^workspace$/i })).not.toHaveAttribute('aria-current');
    });

    it('removes a closable tab after its close button is clicked.', async () => {
        const user = userEvent.setup();

        render(<TabBar />);

        await user.click(screen.getByRole('button', { name: /^close project overview tab$/i }));

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /^project overview$/i })).not.toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /^close project overview tab$/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^workspace$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^nfr-usab-0043$/i })).toBeInTheDocument();
    });
});
