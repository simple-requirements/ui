import { useSelector } from '@tanstack/react-store';

import { Tab } from '@/components/RootLayout/TabBar/Tab';
import { activateTab, closeTab, tabBarStore } from '@/stores/tabBarStore';

import '@/components/RootLayout/TabBar/TabBar.scss';

export function TabBar() {
    const openTabs = useSelector(tabBarStore, (state) => state.openTabs);
    const activeTabId = useSelector(tabBarStore, (state) => state.activeTabId);

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
                    onClick={() => activateTab(tab.id)}
                    onClose={() => closeTab(tab.id)}
                />
            ))}
        </nav>
    );
}
