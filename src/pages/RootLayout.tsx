import { Outlet } from 'react-router';

import { AppToast } from '@/components/Feedback/AppToast/AppToast';
import { ActionBarOutlet } from '@/components/RootLayout/ActionBar/ActionBarOutlet';
import { LoadingOverlay } from '@/components/RootLayout/LoadingOverlay';
import { Sidebar } from '@/components/RootLayout/Sidebar/Sidebar';
import { TabBar } from '@/components/RootLayout/TabBar/TabBar';

import '@/pages/RootLayout.scss';

export function RootLayout() {
    return (
        <main className='root-layout'>
            <div className='root-layout__tabbar'>
                <TabBar />
            </div>

            <div className='root-layout__sidebar'>
                <Sidebar />
            </div>

            <div className='root-layout__actionbar'>
                <ActionBarOutlet />
            </div>

            <section
                className='root-layout__content'
                aria-label='Workspace content'>
                <Outlet />
            </section>

            <AppToast />

            <LoadingOverlay />
        </main>
    );
}
