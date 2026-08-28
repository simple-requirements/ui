import { useState } from "react";

import {
  deleteProjectCategoryRequest,
  getListProjectCategoriesQueryKey,
} from "@/api/categoriesApi";
import { queryClient } from "@/api/queryClient";
import { toastMessages } from "@/components/Feedback/AppToast/toastMessages";
import { showToastMessage } from "@/stores/toastStore";
import {
  canDeleteCategory,
  type CategoryTableRow,
} from "@/pages/ProjectCategories/List/categoryListTypes";

type Options = Readonly<{
  projectId: string | undefined;
  setSelectedCategoryId: (
    updater:
      | string
      | undefined
      | ((id: string | undefined) => string | undefined),
  ) => void;
  onDeleted: () => void;
}>;

export function useDeleteCategory({
  projectId,
  setSelectedCategoryId,
  onDeleted,
}: Options) {
  const [candidate, setCandidate] = useState<CategoryTableRow>();
  const [pending, setPending] = useState(false);

  function request(category: CategoryTableRow): void {
    if (!canDeleteCategory(category)) {
      showToastMessage(toastMessages.categoryCannotBeDeleted(category.key));
      return;
    }
    setCandidate(category);
  }

  async function confirm(): Promise<void> {
    if (projectId === undefined || candidate === undefined) return;
    const category = candidate;
    setPending(true);
    try {
      await deleteProjectCategoryRequest(projectId, category.id);
      await queryClient.invalidateQueries({
        queryKey: getListProjectCategoriesQueryKey(projectId),
      });
      setSelectedCategoryId((current) =>
        current === category.id ? undefined : current,
      );
      setCandidate(undefined);
      onDeleted();
      showToastMessage(toastMessages.categoryDeleted(category.key));
    } catch {
      showToastMessage(toastMessages.categoryDeleteFailed(category.key));
    } finally {
      setPending(false);
    }
  }

  return {
    candidate,
    pending,
    request,
    abort: () => setCandidate(undefined),
    confirm,
  };
}
