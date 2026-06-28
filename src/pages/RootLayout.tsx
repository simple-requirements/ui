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
                <div className='root-layout__content-placeholder'>
                    <h1 className='root-layout__content-title'>Workspace</h1>
                    <p className='root-layout__content-text'>
                        Placeholder content area. Project and requirement views will be rendered here later.
                    </p>
                </div>
            </section>
        </main>
    );
}
