import type { ContextMenu } from "primereact/contextmenu";
import type { MenuItem } from "primereact/menuitem";
import type { RefObject } from "react";
import { useMemo } from "react";

import { AppContextMenu } from "@/components/ContextMenu/AppContextMenu";

type Props = Readonly<{
  contextMenuRef: RefObject<ContextMenu | null>;
  onExportProject?: () => void;
  onExportAllProjects?: () => void;
}>;

export function SidebarContextMenu({
  contextMenuRef,
  onExportProject,
  onExportAllProjects,
}: Props) {
  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        label: "Export project",
        icon: "pi pi-chart-bar",
        command: onExportProject,
      },
      {
        label: "Export all projects",
        icon: "pi pi-database",
        command: onExportAllProjects,
      },
    ],
    [onExportAllProjects, onExportProject],
  );

  return <AppContextMenu ref={contextMenuRef} model={menuItems} />;
}
