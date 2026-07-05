import { z } from 'zod';

import {
    createCategory as createGeneratedCategory,
    getListCategoriesQueryKey,
    listCategories as listGeneratedCategories,
    updateCategory as updateGeneratedCategory,
} from '@/api/generated/categories/categories';

export const categoryTypeSchema = z.enum(['FR', 'NFR']);

export const categorySchema = z.object({
    id: z.uuid(),
    projectId: z.uuid(),
    name: z.string().min(1),
    key: z.string().min(2).max(4),
    type: categoryTypeSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    requirementCount: z.number().int().nonnegative().optional(),
});

export const createCategoryRequestSchema = z.object({
    name: z.string().trim().min(1, 'Name is required.').max(120, 'Name must contain at most 120 characters.'),
    key: z
        .string()
        .trim()
        .transform((key) => key.toUpperCase())
        .pipe(z.string().regex(/^[A-Z]{2,4}$/u, 'Key must contain 2 to 4 uppercase letters.')),
    type: categoryTypeSchema,
});

export const updateCategoryRequestSchema = z.object({
    name: z.string().trim().min(1, 'Name is required.').max(120, 'Name must contain at most 120 characters.'),
});

export type Category = z.infer<typeof categorySchema>;
export type CategoryType = z.infer<typeof categoryTypeSchema>;
export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategoryRequestSchema>;

const categoriesResponseSchema = z.array(categorySchema);

export { getListCategoriesQueryKey as getListProjectCategoriesQueryKey };

export async function listProjectCategoriesRequest(projectId: string): Promise<Category[]> {
    const response = await listGeneratedCategories(projectId);

    return categoriesResponseSchema.parse(response.data);
}

export async function createProjectCategoryRequest(
    projectId: string,
    category: CreateCategoryRequest,
): Promise<Category> {
    const response = await createGeneratedCategory(projectId, category);

    return categorySchema.parse(response.data);
}

export async function updateProjectCategoryRequest(
    projectId: string,
    categoryId: string,
    category: UpdateCategoryRequest,
): Promise<Category> {
    const response = await updateGeneratedCategory(projectId, categoryId, category);

    return categorySchema.parse(response.data);
}
