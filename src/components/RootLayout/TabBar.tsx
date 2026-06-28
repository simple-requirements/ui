import { Button } from 'primereact/button';

import '@/components/RootLayout/TabBar.scss';

const placeholderTabs = ['Project overview', 'NFR-USAB-0043'];

export function TabBar() {
    return (
        <nav
            className='tab-bar'
            aria-label='Workspace tabs'>
            <Button
                outlined
                type='button'
                label='Workspace'
                pt={{
                    root: { className: 'tab-bar__tab tab-bar__tab--fixed tab-bar__tab--active' },
                    label: { className: 'tab-bar__tab-label' },
                }}
            />

            {placeholderTabs.map((tabName) => (
                <Button
                    outlined
                    key={tabName}
                    type='button'
                    label={tabName}
                    pt={{ root: { className: 'tab-bar__tab' }, label: { className: 'tab-bar__tab-label' } }}
                />
            ))}
        </nav>
    );
}
