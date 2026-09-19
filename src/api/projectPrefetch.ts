import { getListProjectCategoriesQueryKey, listProjectCategoriesRequest } from '@/api/categoriesApi';
import { queryClient } from '@/api/queryClient';
import { getListProjectRequirementsQueryKey, listProjectRequirementsRequest } from '@/api/requirementsApi';

async function queryWithoutSurfacingError(query: Promise<unknown>): Promise<void> {
    await query.then(() => undefined).catch(() => undefined);
}

/** Warms the requirements cache for a project on likely navigation intent. */
export function prefetchProjectRequirements(projectId: string): Promise<void> {
    return queryWithoutSurfacingError(
        queryClient.prefetchQuery({
            queryKey: getListProjectRequirementsQueryKey(projectId),
            queryFn: () => listProjectRequirementsRequest(projectId),
        }),
    );
}

/** Warms the categories cache for a project on likely navigation intent. */
export function prefetchProjectCategories(projectId: string): Promise<void> {
    return queryWithoutSurfacingError(
        queryClient.prefetchQuery({
            queryKey: getListProjectCategoriesQueryKey(projectId),
            queryFn: () => listProjectCategoriesRequest(projectId),
        }),
    );
}

/** Warms both collection-backed datasets required by the project overview. */
export async function prefetchProjectDetails(projectId: string): Promise<void> {
    await Promise.all([prefetchProjectCategories(projectId), prefetchProjectRequirements(projectId)]);
}
