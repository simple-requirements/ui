import type { ContextMenu } from 'primereact/contextmenu';
import type { MenuItem } from 'primereact/menuitem';
import type { RefObject } from 'react';
import { useMemo } from 'react';

import { AppContextMenu } from '@/components/ContextMenu/AppContextMenu';

type Props = Readonly<{
    contextMenuRef: RefObject<ContextMenu | null>;
    canExportProject: boolean;
    onExportProject?: () => void;
}>;

export function SidebarContextMenu({ contextMenuRef, canExportProject, onExportProject }: Props) {
    const menuItems = useMemo<MenuItem[]>(
        () => [
            { label: 'Export project', icon: 'pi pi-download', command: onExportProject, disabled: !canExportProject },
        ],
        [canExportProject, onExportProject],
    );

    return (
        <AppContextMenu
            ref={contextMenuRef}
            model={menuItems}
        />
    );
}
