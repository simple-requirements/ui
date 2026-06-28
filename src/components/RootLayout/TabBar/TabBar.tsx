import { Tab } from '@/components/RootLayout/TabBar/Tab';

import '@/components/RootLayout/TabBar/TabBar.scss';

const placeholderTabs = ['Project overview', 'NFR-USAB-0043'];

export function TabBar() {
    return (
        <nav
            className='tab-bar'
            aria-label='Workspace tabs'>
            <Tab
                label='Workspace'
                active
                fixed
            />

            {placeholderTabs.map((tabName) => (
                <Tab
                    key={tabName}
                    label={tabName}
                />
            ))}
        </nav>
    );
}
