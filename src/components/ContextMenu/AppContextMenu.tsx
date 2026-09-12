import { ContextMenu } from 'primereact/contextmenu';
import type { MenuItem } from 'primereact/menuitem';
import { forwardRef } from 'react';

import '@/components/ContextMenu/AppContextMenu.scss';

type Props = Readonly<{ model: MenuItem[] }>;

export const AppContextMenu = forwardRef<ContextMenu, Props>(function AppContextMenu({ model }, ref) {
    return (
        <ContextMenu
            ref={ref}
            model={model}
            pt={{
                root: { className: 'app-context-menu' },
                menu: { className: 'app-context-menu__menu' },
                menuitem: { className: 'app-context-menu__item' },
                action: { className: 'app-context-menu__action' },
                icon: { className: 'app-context-menu__icon' },
                label: { className: 'app-context-menu__label' },
                separator: { className: 'app-context-menu__separator' },
            }}
        />
    );
});
