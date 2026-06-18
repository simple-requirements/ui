import { apiFetch } from '@/api/client/config';
import type { CategoryResponseDto, CreateCategoryDto } from '@/api/generated/models';
import type { Category } from '@/types/domain';

export function mapCategory(dto: CategoryResponseDto): Category {
    return { id: dto.id, key: dto.key, name: dto.name, type: dto.type };
}
export async function listCategories(init?: RequestInit) {
    return (await apiFetch<CategoryResponseDto[]>('/categories', { ...init, method: 'GET' })).map(mapCategory);
}
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
