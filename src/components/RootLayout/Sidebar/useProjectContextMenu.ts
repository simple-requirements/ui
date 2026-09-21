import type { ContextMenu } from 'primereact/contextmenu';
import type { MouseEvent } from 'react';
import { useMemo, useRef, useState } from 'react';

import type { SidebarProject } from '@/api/collections/projectsCollection';

export type ProjectContextMenuController = Readonly<{
    contextMenuRef: React.RefObject<ContextMenu | null>;
    contextMenuProject: SidebarProject | undefined;
    openProjectContextMenu: (projectId: string, event: MouseEvent<HTMLButtonElement>) => void;
}>;

export function useProjectContextMenu(projects: readonly SidebarProject[]): ProjectContextMenuController {
    const contextMenuRef = useRef<ContextMenu | null>(null);
    const [contextMenuProjectId, setContextMenuProjectId] = useState<string>();

    const contextMenuProject = useMemo(
        () => projects.find((project) => project.id === contextMenuProjectId),
        [contextMenuProjectId, projects],
    );

    function openProjectContextMenu(projectId: string, event: MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();

        setContextMenuProjectId(projectId);
        contextMenuRef.current?.show(event);
    }

    return { contextMenuRef, contextMenuProject, openProjectContextMenu };
}
