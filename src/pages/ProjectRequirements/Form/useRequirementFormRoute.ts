import { useParams, useSearchParams } from 'react-router';

import type { RequirementFormMode } from '@/pages/ProjectRequirements/Form/requirementFormTypes';

export type RequirementFormRoute = Readonly<{
    projectId: string | undefined;
    requirementId: string | undefined;
    initialCategoryId: string | undefined;
    mode: RequirementFormMode;
}>;

export function getRequirementFormMode(requirementId: string | undefined): RequirementFormMode {
    return requirementId === undefined ? 'create' : 'update';
}

export function useRequirementFormRoute(): RequirementFormRoute {
    const { projectId, requirementId } = useParams();
    const [searchParams] = useSearchParams();
    const initialCategoryId = searchParams.get('categoryId') ?? undefined;

    return {
        projectId,
        requirementId,
        initialCategoryId,
        mode: getRequirementFormMode(requirementId),
    };
}
