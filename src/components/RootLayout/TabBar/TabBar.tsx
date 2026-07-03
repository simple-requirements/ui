import { useSelector } from '@tanstack/react-store';
import { useNavigate } from 'react-router';

import { Tab } from '@/components/RootLayout/TabBar/Tab';
import { getProjectCategoryDetailsCloseRoute } from '@/router/projectRoutes';
import { activateTab, clearActiveTab, closeTab, tabBarStore, type TabBarTab } from '@/stores/tabBarStore';

import '@/components/RootLayout/TabBar/TabBar.scss';

function isRouteTabId(tabId: string): boolean {
    return tabId.startsWith('/');
}

export function TabBar() {
    const navigate = useNavigate();

    const openTabs = useSelector(tabBarStore, (state) => state.openTabs);
    const activeTabId = useSelector(tabBarStore, (state) => state.activeTabId);

    function handleSelectTab(tab: TabBarTab): void {
        activateTab(tab.id);

        if (isRouteTabId(tab.id)) {
            void navigate(tab.id);
        }
    }

    function handleCloseTab(tab: TabBarTab): void {
        const tabWasActive = tab.id === activeTabId;
        const closeRoute = getProjectCategoryDetailsCloseRoute(tab.id);
        const nextActiveTab = closeTab(tab.id);

        if (!tabWasActive) {
            return;
        }

        if (closeRoute !== undefined) {
            clearActiveTab();
            void navigate(closeRoute);

            return;
        }

        if (nextActiveTab !== undefined && isRouteTabId(nextActiveTab.id)) {
            void navigate(nextActiveTab.id);
        }
    }

    return (
        <nav
            className='tab-bar'
            aria-label='Workspace tabs'>
            {openTabs.map((tab) => (
                <Tab
                    key={tab.id}
                    label={tab.label}
                    active={tab.id === activeTabId}
                    fixed={tab.fixed}
                    closable={tab.closable !== false}
                    onClick={() => handleSelectTab(tab)}
                    onClose={() => handleCloseTab(tab)}
                />
            ))}
        </nav>
    );
}
