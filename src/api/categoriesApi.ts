import { z } from 'zod';

import { apiFetch } from '@/api/fetch';

export const categorySchema = z.object({
    id: z.uuid(),
    projectId: z.uuid(),
    name: z.string().min(1),
    key: z.string().min(2).max(4),
    type: z.enum(['FR', 'NFR']),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),

    // Computed/frontend-facing value for now.
    // The backend currently has no requirements, so missing values default to 0.
    requirementCount: z.number().int().nonnegative().default(0),
});

export type Category = z.infer<typeof categorySchema>;

const categoriesResponseSchema = z.array(categorySchema);

type ListProjectCategoriesResponse = Readonly<{ data: unknown; status: number; headers: Headers }>;

export function getListProjectCategoriesQueryKey(projectId: string) {
    return ['/projects', projectId, 'categories'] as const;
}

export async function listProjectCategoriesRequest(projectId: string): Promise<Category[]> {
    const response = await apiFetch<ListProjectCategoriesResponse>(
        `/projects/${encodeURIComponent(projectId)}/categories`,
    );

    return categoriesResponseSchema.parse(response.data);
}
