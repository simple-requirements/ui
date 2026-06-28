import { Outlet } from 'react-router';

import { ActionBar } from '@/components/RootLayout/ActionBar';
import { Sidebar } from '@/components/RootLayout/Sidebar';
import { TabBar } from '@/components/RootLayout/TabBar';

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
                <ActionBar />
            </div>

            <section
                className='root-layout__content'
                aria-label='Workspace content'>
                <Outlet />
            </section>
        </main>
    );
}
