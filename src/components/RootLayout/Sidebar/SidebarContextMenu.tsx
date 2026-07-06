import type { ContextMenu } from 'primereact/contextmenu';
import type { MenuItem } from 'primereact/menuitem';
import type { RefObject } from 'react';
import { useMemo } from 'react';

import { AppContextMenu } from '@/components/ContextMenu/AppContextMenu';

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
        <AppContextMenu
            ref={contextMenuRef}
            model={menuItems}
        />
    );
}
