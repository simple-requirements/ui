import { ContextMenu } from 'primereact/contextmenu';
import type { MenuItem } from 'primereact/menuitem';
import type { RefObject } from 'react';
import { useMemo } from 'react';

import '@/components/RootLayout/Sidebar/SidebarContextMenu.scss';

type Props = Readonly<{
    contextMenuRef: RefObject<ContextMenu | null>;
    onRenameProject?: () => void;
    onDeleteProject?: () => void;
    onExportProject?: () => void;
    onExportAllProjects?: () => void;
}>;

export function SidebarContextMenu({
    contextMenuRef,
    onRenameProject,
    onDeleteProject,
    onExportProject,
    onExportAllProjects,
}: Props) {
    const menuItems = useMemo<MenuItem[]>(
        () => [
            { label: 'Rename project', icon: 'pi pi-pencil', command: onRenameProject },
            { label: 'Delete project', icon: 'pi pi-trash', command: onDeleteProject },
            { separator: true },
            { label: 'Export project', icon: 'pi pi-chart-bar', command: onExportProject },
            { label: 'Export all projects', icon: 'pi pi-database', command: onExportAllProjects },
        ],
        [onDeleteProject, onExportAllProjects, onExportProject, onRenameProject],
    );

    return (
        <ContextMenu
            ref={contextMenuRef}
            model={menuItems}
            pt={{
                root: { className: 'sidebar-context-menu' },
                menu: { className: 'sidebar-context-menu__menu' },
                menuitem: { className: 'sidebar-context-menu__item' },
                action: { className: 'sidebar-context-menu__action' },
                icon: { className: 'sidebar-context-menu__icon' },
                label: { className: 'sidebar-context-menu__label' },
                separator: { className: 'sidebar-context-menu__separator' },
            }}
        />
    );
}
