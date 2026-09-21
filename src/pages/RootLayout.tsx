import { useSelector } from '@tanstack/react-store';
import { Outlet } from 'react-router';

import { isAdministrator } from '@/auth/globalPermissions';
import { AppToast } from '@/components/Feedback/AppToast/AppToast';
import { ActionBar } from '@/components/RootLayout/ActionBar/ActionBar';
import { AdministratorSidebar } from '@/components/RootLayout/AdministratorSidebar/AdministratorSidebar';
import { LoadingOverlay } from '@/components/RootLayout/LoadingOverlay';
import { Sidebar } from '@/components/RootLayout/Sidebar/Sidebar';
import { TabBar } from '@/components/RootLayout/TabBar/TabBar';
import { authStore } from '@/stores/authStore';

import '@/pages/RootLayout.scss';

/**
 * Renders the authenticated application shell with role-appropriate navigation and content.
 * @returns Main authenticated application layout.
 */
export function RootLayout() {
    const administrator = useSelector(authStore, (state) => isAdministrator(state.user));

    return (
        <main className='root-layout'>
            <div className='root-layout__tabbar'>
                <TabBar />
            </div>

            <div className='root-layout__sidebar'>
                {administrator ?
                    <AdministratorSidebar />
                :   <Sidebar />}
            </div>

            <div className='root-layout__actionbar'>
                <ActionBar />
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
