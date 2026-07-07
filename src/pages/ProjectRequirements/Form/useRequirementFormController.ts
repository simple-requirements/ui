import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { getProjectRequirementDetailsRoute } from '@/router/projectRoutes';
import { openTab } from '@/stores/tabBarStore';
import { showToastMessage } from '@/stores/toastStore';

import {
    type RequirementFormData,
    type RequirementFormFieldName,
    type RequirementFormMode,
    type RequirementFormState,
    type RequirementFormValues,
} from '@/pages/ProjectRequirements/Form/requirementFormTypes';
import {
    getInitialRequirementFormValues,
    hasRequirementFormChanges,
} from '@/pages/ProjectRequirements/Form/requirementFormValidation';
import { useRequirementFormAction } from '@/pages/ProjectRequirements/Form/useRequirementFormAction';
import { useRequirementFormNavigation } from '@/pages/ProjectRequirements/Form/useRequirementFormNavigation';

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

function getFormTitle(mode: RequirementFormMode): string {
    return mode === 'create' ? 'Create requirement' : 'Update requirement';
}

function getFormKey(
    mode: RequirementFormMode,
    projectId: string | undefined,
    requirementId: string | undefined,
    initialCategoryId: string | undefined,
): string {
    return `${mode}:${requirementId ?? projectId ?? 'missing-project'}:${initialCategoryId ?? ''}`;
}

export function useRequirementFormController(
    projectId: string | undefined,
    requirementId: string | undefined,
    initialCategoryId: string | undefined,
    mode: RequirementFormMode,
    data: RequirementFormData,
): RequirementFormController {
    const navigate = useNavigate();
    const initialValues = useMemo(
        () => getInitialRequirementFormValues(mode, data.requirement, initialCategoryId),
        [data.requirement, initialCategoryId, mode],
    );
    const formKey = getFormKey(mode, projectId, data.requirement?.id ?? requirementId, initialCategoryId);
    const formTitle = getFormTitle(mode);

    const [formValues, setFormValues] = useState<RequirementFormValues>(initialValues);
    const isDirty = hasRequirementFormChanges(formValues, initialValues);

    useEffect(() => {
        setFormValues(initialValues);
    }, [formKey, initialValues]);

    const navigation = useRequirementFormNavigation(projectId, requirementId, mode, isDirty);

    const [formState, formAction, pending] = useRequirementFormAction({
        projectId,
        requirementId,
        mode,
        onSaved: (savedRequirement) => {
            if (projectId === undefined) {
                return;
            }

            const detailsRoute = getProjectRequirementDetailsRoute(projectId, savedRequirement.id);

            showToastMessage({
                severity: 'success',
                summary: mode === 'create' ? 'Requirement created' : 'Requirement updated',
                detail: `${savedRequirement.visibleKey} has been ${mode === 'create' ? 'created' : 'updated'}.`,
                life: 3000,
            });

            navigation.allowNavigation();
            openTab({
                id: detailsRoute,
                label: savedRequirement.visibleKey,
                closable: true,
            });
            void navigate(detailsRoute);
        },
    });

    function updateFormValue(fieldName: RequirementFormFieldName, value: string): void {
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
