import { useActionState } from 'react';

import { queryClient } from '@/api/queryClient';
import {
    createProjectRequirementRequest,
    getListProjectRequirementsQueryKey,
    updateProjectRequirementRequest,
    type CreateRequirementRequest,
    type Requirement,
    type UpdateRequirementRequest,
} from '@/api/requirementsApi';

import {
    emptyRequirementFormState,
    type RequirementFormMode,
    type RequirementFormState,
} from '@/pages/ProjectRequirements/Form/requirementFormTypes';
import {
    getRequirementFormDataString,
    getRequirementFormFieldErrors,
    getRequirementFormSchema,
} from '@/pages/ProjectRequirements/Form/requirementFormValidation';

export type UseRequirementFormActionOptions = Readonly<{
    projectId: string | undefined;
    requirementId: string | undefined;
    mode: RequirementFormMode;
    onSaved: (requirement: Requirement) => void;
}>;

export function useRequirementFormAction({ projectId, requirementId, mode, onSaved }: UseRequirementFormActionOptions) {
    return useActionState<RequirementFormState, FormData>(async (_previousState, formData) => {
        if (projectId === undefined) {
            return { fieldErrors: {}, formError: 'Project route is missing a project id.' };
        }

        const rawValues = {
            categoryId: getRequirementFormDataString(formData, 'categoryId'),
            description: getRequirementFormDataString(formData, 'description'),
            priority: getRequirementFormDataString(formData, 'priority'),
            owner: getRequirementFormDataString(formData, 'owner'),
            rationale: getRequirementFormDataString(formData, 'rationale'),
            source: getRequirementFormDataString(formData, 'source'),
            changeReason: getRequirementFormDataString(formData, 'changeReason'),
        };
        const parseResult = getRequirementFormSchema(mode).safeParse(rawValues);

        if (!parseResult.success) {
            return { fieldErrors: getRequirementFormFieldErrors(parseResult.error) };
        }

        try {
            const savedRequirement =
                mode === 'create' ?
                    await createProjectRequirementRequest(projectId, parseResult.data as CreateRequirementRequest)
                : requirementId === undefined ? undefined
                : await updateProjectRequirementRequest(
                        projectId,
                        requirementId,
                        parseResult.data as UpdateRequirementRequest,
                    );

            if (savedRequirement === undefined) {
                return { fieldErrors: {}, formError: 'Requirement route is incomplete.' };
            }

            await queryClient.invalidateQueries({ queryKey: getListProjectRequirementsQueryKey(projectId) });
            onSaved(savedRequirement);

            return emptyRequirementFormState;
        } catch (error) {
            return {
                fieldErrors: {},
                formError: error instanceof Error ? error.message : 'Requirement could not be saved.',
            };
        }
    }, emptyRequirementFormState);
}
