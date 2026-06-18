import { apiFetch } from '@/api/client/config';
import type { CategoryResponseDto, CreateCategoryDto } from '@/api/generated/models';
import type { Category } from '@/types/domain';

/** Maps the generated category DTO into the UI category view model. */
export function mapCategory(dto: CategoryResponseDto): Category {
    return { id: dto.id, key: dto.key, name: dto.name, type: dto.type };
}

/** Lists global categories using the backend path described by the OpenAPI contract. */
export async function listCategories(init?: RequestInit) {
    return (await apiFetch<CategoryResponseDto[]>('/categories', { ...init, method: 'GET' })).map(mapCategory);
}

/** Creates a global category using the generated request and response DTO types. */
export async function createCategory(input: CreateCategoryDto, init?: RequestInit) {
    return mapCategory(
        await apiFetch<CategoryResponseDto>('/categories', {
            ...init,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        }),
    );
}
