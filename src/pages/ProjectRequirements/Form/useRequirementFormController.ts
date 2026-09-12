import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import {
  getProjectRequirementDetailsRoute,
  getProjectRequirementReviewRoute,
} from "@/router/projectRoutes";
import { toastMessages } from "@/components/Feedback/AppToast/toastMessages";
import { openTab } from "@/stores/tabBarStore";
import { showToastMessage } from "@/stores/toastStore";

import {
  type RequirementFormData,
  type RequirementFormFieldName,
  type RequirementFormMode,
  type RequirementFormState,
  type RequirementFormValues,
} from "@/pages/ProjectRequirements/Form/requirementFormTypes";
import {
  getInitialRequirementFormValues,
  hasRequirementFormChanges,
} from "@/pages/ProjectRequirements/Form/requirementFormValidation";
import { getRequirementFormKey, getRequirementFormTitle } from "@/pages/ProjectRequirements/Form/requirementFormPresentation";
import { useRequirementFormAction } from "@/pages/ProjectRequirements/Form/useRequirementFormAction";
import { useRequirementFormNavigation } from "@/pages/ProjectRequirements/Form/useRequirementFormNavigation";

export type RequirementFormController = Readonly<{
  formKey: string;
  formRoute: string;
  formTitle: string;
  formValues: RequirementFormValues;
  formState: RequirementFormState;
  isDirty: boolean;
  pending: boolean;
  updateFormValue: (fieldName: RequirementFormFieldName, value: string) => void;
  handleAbort: () => void;
  formAction: (payload: FormData) => void;
  dirtyNavigationDialog: Readonly<{
    visible: boolean;
    onStay: () => void;
    onDiscard: () => void;
  }>;
}>;

export function useRequirementFormController(
  projectId: string | undefined,
  requirementId: string | undefined,
  initialCategoryId: string | undefined,
  mode: RequirementFormMode,
  data: RequirementFormData,
): RequirementFormController {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialValues = useMemo(
    () =>
      getInitialRequirementFormValues(
        mode,
        data.requirement,
        initialCategoryId,
      ),
    [data.requirement, initialCategoryId, mode],
  );
  const formKey = getRequirementFormKey(
    mode,
    projectId,
    data.requirement?.id ?? requirementId,
    initialCategoryId,
  );
  const formTitle = getRequirementFormTitle(mode);

  const [formValues, setFormValues] =
    useState<RequirementFormValues>(initialValues);
  const isDirty = hasRequirementFormChanges(formValues, initialValues);

  useEffect(() => {
    setFormValues(initialValues);
  }, [formKey, initialValues]);

  const navigation = useRequirementFormNavigation(
    projectId,
    requirementId,
    mode,
    isDirty,
  );

  const [formState, formAction, pending] = useRequirementFormAction({
    projectId,
    requirementId,
    mode,
    onSaved: (savedRequirement) => {
      if (projectId === undefined) {
        return;
      }

      const detailsRoute = getProjectRequirementDetailsRoute(
        projectId,
        savedRequirement.id,
      );
      const destinationRoute =
        mode === "update" && searchParams.get("returnTo") === "review"
          ? getProjectRequirementReviewRoute(projectId, savedRequirement.id)
          : detailsRoute;

      showToastMessage(
        toastMessages.requirementSaved(savedRequirement.visibleKey, mode),
      );

      navigation.allowNavigation();
      openTab({
        id: detailsRoute,
        label: savedRequirement.visibleKey,
        closable: true,
      });
      void navigate(destinationRoute);
    },
  });

  function updateFormValue(
    fieldName: RequirementFormFieldName,
    value: string,
  ): void {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
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
