import type { ContextMenu } from "primereact/contextmenu";
import type { MenuItem } from "primereact/menuitem";
import { type RefObject, type SyntheticEvent, useRef, useState } from "react";
import type { NavigateFunction } from "react-router";

import type { Category } from "@/api/categoriesApi";
import { toastMessages } from "@/components/Feedback/AppToast/toastMessages";
import {
  getProjectCategoryDetailsRoute,
  getProjectCategoryEditRoute,
  getProjectRequirementCreateRoute,
} from "@/router/projectRoutes";
import { openTab } from "@/stores/tabBarStore";
import { showToastMessage } from "@/stores/toastStore";

import {
  canDeleteCategory,
  type CategoryTableRow,
} from "@/pages/ProjectCategories/List/categoryListTypes";
import { useDeleteCategory } from "@/pages/ProjectCategories/List/useDeleteCategory";

type CategoryNavigationTarget = Pick<Category, "id" | "key">;

type UseCategoryListControllerOptions = Readonly<{
  projectId: string | undefined;
  navigate: NavigateFunction;
  canManageRequirements: boolean;
  setSelectedCategoryId: (
    updater:
      | string
      | undefined
      | ((categoryId: string | undefined) => string | undefined),
  ) => void;
}>;

export type CategoryListController = Readonly<{
  contextMenuRef: RefObject<ContextMenu | null>;
  contextMenuItems: MenuItem[];
  deleteCategoryCandidate: CategoryTableRow | undefined;
  deletePending: boolean;
  copyCategoryKey: (category: CategoryTableRow) => Promise<void>;
  openCategory: (category: CategoryTableRow) => void;
  editCategory: (category: CategoryNavigationTarget) => void;
  openContextMenu: (category: CategoryTableRow, event: SyntheticEvent) => void;
  abortDeleteCategory: () => void;
  confirmDeleteCategory: () => Promise<void>;
}>;

export function useCategoryListController({
  projectId,
  navigate,
  canManageRequirements,
  setSelectedCategoryId,
}: UseCategoryListControllerOptions): CategoryListController {
  const contextMenuRef = useRef<ContextMenu | null>(null);
  const [contextMenuCategory, setContextMenuCategory] =
    useState<CategoryTableRow>();
  const deletion = useDeleteCategory({
    projectId,
    setSelectedCategoryId,
    onDeleted: () => setContextMenuCategory(undefined),
  });

  async function copyCategoryKey(category: CategoryTableRow): Promise<void> {
    await navigator.clipboard.writeText(category.key);

    showToastMessage(toastMessages.categoryKeyCopied(category.key));
  }

  function editCategory(category: CategoryNavigationTarget): void {
    if (projectId === undefined) {
      return;
    }

    const categoryDetailsRoute = getProjectCategoryDetailsRoute(
      projectId,
      category.id,
    );
    const categoryEditRoute = getProjectCategoryEditRoute(
      projectId,
      category.id,
    );

    openTab({
      id: categoryDetailsRoute,
      label: `Category ${category.key}`,
      closable: true,
    });
    void navigate(categoryEditRoute);
  }

  function requestDeleteCategory(category: CategoryTableRow): void {
    deletion.request(category);
  }

  function addRequirement(category: CategoryTableRow): void {
    if (projectId === undefined) {
      return;
    }

    void navigate(getProjectRequirementCreateRoute(projectId, category.id));
  }

  function openCategory(category: CategoryTableRow): void {
    if (projectId === undefined) {
      return;
    }

    const categoryDetailsRoute = getProjectCategoryDetailsRoute(
      projectId,
      category.id,
    );

    setSelectedCategoryId(category.id);
    openTab({
      id: categoryDetailsRoute,
      label: `Category ${category.key}`,
      closable: true,
    });
    void navigate(categoryDetailsRoute);
  }

  function openContextMenu(
    category: CategoryTableRow,
    event: SyntheticEvent,
  ): void {
    setContextMenuCategory(category);
    contextMenuRef.current?.show(event);
  }

  const contextMenuItems: MenuItem[] = canManageRequirements
    ? [
        {
          label: "Edit",
          icon: "pi pi-pencil",
          command: () => {
            if (contextMenuCategory !== undefined) {
              editCategory(contextMenuCategory);
            }
          },
        },
        {
          label: "Delete",
          icon: "pi pi-trash",
          disabled:
            contextMenuCategory === undefined ||
            !canDeleteCategory(contextMenuCategory),
          command: () => {
            if (contextMenuCategory !== undefined) {
              requestDeleteCategory(contextMenuCategory);
            }
          },
        },
        {
          label: "Add requirement",
          icon: "pi pi-plus",
          command: () => {
            if (contextMenuCategory !== undefined) {
              addRequirement(contextMenuCategory);
            }
          },
        },
      ]
    : [];

  return {
    contextMenuRef,
    contextMenuItems,
    deleteCategoryCandidate: deletion.candidate,
    deletePending: deletion.pending,
    copyCategoryKey,
    openCategory,
    editCategory,
    openContextMenu,
    abortDeleteCategory: deletion.abort,
    confirmDeleteCategory: deletion.confirm,
  };
}
