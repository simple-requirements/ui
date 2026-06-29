import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { tabBarStore } from '@/stores/tabBarStore';
import { TabBar } from '@/components/RootLayout/TabBar/TabBar';

type TestTabBarTab = Readonly<{ id: string; label: string; fixed?: boolean }>;

type TestTabBarState = Readonly<{ openTabs: readonly TestTabBarTab[]; activeTabId: string | undefined }>;

const mocks = vi.hoisted(() => ({ activateTab: vi.fn(), closeTab: vi.fn() }));

vi.mock('@/stores/tabBarStore', async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const { Store } = await vi.importActual<typeof import('@tanstack/react-store')>('@tanstack/react-store');

    type MockTabBarTab = Readonly<{ id: string; label: string; fixed?: boolean }>;

    type MockTabBarState = Readonly<{ openTabs: readonly MockTabBarTab[]; activeTabId: string | undefined }>;

    const initialOpenTabs: readonly MockTabBarTab[] = [
        { id: 'workspace', label: 'Workspace', fixed: true },
        { id: 'project-overview', label: 'Project overview' },
        { id: 'nfr-usab-0043', label: 'NFR-USAB-0043' },
    ];

    const tabBarStore = new Store<MockTabBarState>({ openTabs: initialOpenTabs, activeTabId: 'workspace' });

    function activateTab(tabId: string): void {
        mocks.activateTab(tabId);

        tabBarStore.setState((state) => {
            const tabExists = state.openTabs.some((tab) => tab.id === tabId);

            if (!tabExists) {
                return state;
            }

            return { ...state, activeTabId: tabId };
        });
    }

    function closeTab(tabId: string): void {
        mocks.closeTab(tabId);

        tabBarStore.setState((state) => {
            const remainingTabs = state.openTabs.filter((tab) => tab.id !== tabId);

            return {
                ...state,
                openTabs: remainingTabs,
                activeTabId: state.activeTabId === tabId ? remainingTabs[0]?.id : state.activeTabId,
            };
        });
    }

    return { tabBarStore, activateTab, closeTab };
});

function createDefaultOpenTabs(): readonly TestTabBarTab[] {
    return [
        { id: 'workspace', label: 'Workspace', fixed: true },
        { id: 'project-overview', label: 'Project overview' },
        { id: 'nfr-usab-0043', label: 'NFR-USAB-0043' },
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
    it('renders the workspace tabs navigation.', () => {
        render(<TabBar />);

        expect(screen.getByRole('navigation', { name: /workspace tabs/i })).toBeInTheDocument();
    });

    it('renders all open tabs.', () => {
        render(<TabBar />);

        expect(screen.getByRole('button', { name: /^workspace$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^project overview$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^nfr-usab-0043$/i })).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /^close workspace tab$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^close project overview tab$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^close nfr-usab-0043 tab$/i })).toBeInTheDocument();
    });

    it('marks the active tab from the store.', () => {
        setMockTabBarState({ openTabs: createDefaultOpenTabs(), activeTabId: 'project-overview' });

        render(<TabBar />);

        const projectOverviewGroup = screen.getByRole('group', { name: /project overview tab/i });
        const projectOverviewButton = screen.getByRole('button', { name: /^project overview$/i });

        expect(projectOverviewGroup).toHaveClass('tab--active');
        expect(projectOverviewButton).toHaveAttribute('aria-current', 'page');

        expect(screen.getByRole('group', { name: /workspace tab/i })).not.toHaveClass('tab--active');
        expect(screen.getByRole('button', { name: /^workspace$/i })).not.toHaveAttribute('aria-current');
    });

    it('marks fixed tabs from the store.', () => {
        render(<TabBar />);

        expect(screen.getByRole('group', { name: /workspace tab/i })).toHaveClass('tab--fixed');
        expect(screen.getByRole('group', { name: /project overview tab/i })).not.toHaveClass('tab--fixed');
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

    it('calls activateTab when a tab select button is clicked.', async () => {
        const user = userEvent.setup();

        render(<TabBar />);

        await user.click(screen.getByRole('button', { name: /^project overview$/i }));

        expect(mocks.activateTab).toHaveBeenCalledTimes(1);
        expect(mocks.activateTab).toHaveBeenCalledWith('project-overview');
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

    it('calls closeTab when a tab close button is clicked.', async () => {
        const user = userEvent.setup();

        render(<TabBar />);

        await user.click(screen.getByRole('button', { name: /^close project overview tab$/i }));

        expect(mocks.closeTab).toHaveBeenCalledTimes(1);
        expect(mocks.closeTab).toHaveBeenCalledWith('project-overview');
    });

    it('removes a tab after its close button is clicked.', async () => {
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
