import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { categoryTypeSchema, type Category } from "@/api/categoriesApi";
import { toastMessages } from "@/components/Feedback/AppToast/toastMessages";
import { getProjectCategoryDetailsRoute } from "@/router/projectRoutes";
import { openTab } from "@/stores/tabBarStore";
import { showToastMessage } from "@/stores/toastStore";

import {
  createCategoryInitialValues,
  type CategoryFormData,
  type CategoryFormFieldName,
  type CategoryFormMode,
  type CategoryFormState,
  type CategoryFormValues,
} from "@/pages/ProjectCategories/Form/categoryFormTypes";
import { hasCategoryFormChanges } from "@/pages/ProjectCategories/Form/categoryFormValidation";
import { useCategoryFormAction } from "@/pages/ProjectCategories/Form/useCategoryFormAction";
import { useCategoryFormNavigation } from "@/pages/ProjectCategories/Form/useCategoryFormNavigation";

export type CategoryFormController = Readonly<{
  formKey: string;
  formRoute: string;
  formTitle: string;
  formValues: CategoryFormValues;
  formState: CategoryFormState;
  isDirty: boolean;
  pending: boolean;
  updateFormValue: (fieldName: CategoryFormFieldName, value: string) => void;
  handleAbort: () => void;
  formAction: (payload: FormData) => void;
  dirtyNavigationDialog: Readonly<{
    visible: boolean;
    onStay: () => void;
    onDiscard: () => void;
  }>;
}>;

function getInitialValues(
  mode: CategoryFormMode,
  category: Category | undefined,
): CategoryFormValues {
  if (mode === "create" || category === undefined) {
    return createCategoryInitialValues;
  }

  return { name: category.name, key: category.key, type: category.type };
}

function getFormTitle(mode: CategoryFormMode): string {
  return mode === "create" ? "Create category" : "Update category";
}

function getFormKey(
  mode: CategoryFormMode,
  projectId: string | undefined,
  category: Category | undefined,
): string {
  return `${mode}:${category?.id ?? projectId ?? "missing-project"}`;
}

export function useCategoryFormController(
  projectId: string | undefined,
  categoryId: string | undefined,
  mode: CategoryFormMode,
  data: CategoryFormData,
): CategoryFormController {
  const navigate = useNavigate();
  const initialValues = useMemo(
    () => getInitialValues(mode, data.category),
    [data.category, mode],
  );
  const formKey = getFormKey(mode, projectId, data.category);
  const formTitle = getFormTitle(mode);

  const [formValues, setFormValues] =
    useState<CategoryFormValues>(initialValues);
  const isDirty = hasCategoryFormChanges(formValues, initialValues);

  useEffect(() => {
    setFormValues(initialValues);
  }, [formKey, initialValues]);

  const navigation = useCategoryFormNavigation(
    projectId,
    categoryId,
    mode,
    isDirty,
    data.category?.id,
    data.category?.key,
  );

  const [formState, formAction, pending] = useCategoryFormAction({
    projectId,
    categoryId,
    mode,
    data,
    onSaved: (savedCategory) => {
      if (projectId === undefined) {
        return;
      }

      const detailsRoute = getProjectCategoryDetailsRoute(
        projectId,
        savedCategory.id,
      );

      showToastMessage(toastMessages.categorySaved(savedCategory.key, mode));

      navigation.allowNavigation();
      openTab({
        id: detailsRoute,
        label: `Category ${savedCategory.key}`,
        closable: true,
      });
      void navigate(detailsRoute);
    },
  });

  function updateFormValue(
    fieldName: CategoryFormFieldName,
    value: string,
  ): void {
    if (fieldName === "type") {
      const typeParseResult = categoryTypeSchema.safeParse(value);

      if (!typeParseResult.success) {
        return;
      }

      setFormValues((currentValues) => ({
        ...currentValues,
        type: typeParseResult.data,
      }));

      return;
    }

    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: fieldName === "key" ? value.toUpperCase() : value,
    }));
  }

  return {
    formKey,
    formRoute: navigation.formRoute,
    formTitle,
    formValues,
    formState,
    isDirty,
    pending,
    updateFormValue,
    handleAbort: navigation.handleAbort,
    formAction,
    dirtyNavigationDialog: {
      visible: navigation.dirtyNavigationDialogVisible,
      onStay: navigation.stayOnPage,
      onDiscard: navigation.discardChanges,
    },
  };
}
