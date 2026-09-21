import { useParams } from 'react-router';

import type { CategoryFormMode } from '@/pages/ProjectCategories/Form/categoryFormTypes';

export type CategoryFormRoute = Readonly<{
    projectId: string | undefined;
    categoryId: string | undefined;
    mode: CategoryFormMode;
}>;

export function getCategoryFormMode(categoryId: string | undefined): CategoryFormMode {
    return categoryId === undefined ? 'create' : 'update';
}

export function useCategoryFormRoute(): CategoryFormRoute {
    const { projectId, categoryId } = useParams();

    return { projectId, categoryId, mode: getCategoryFormMode(categoryId) };
}
