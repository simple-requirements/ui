import { runOrvalFetch } from '@/api/client/config';
import { getCategories, postCategories } from '@/api/generated/endpoints/categories/categories';
import type { CategoryResponseDto, CreateCategoryDto } from '@/api/generated/models';
import type { Category } from '@/types/domain';

export function mapCategory(dto: CategoryResponseDto): Category {
    return { id: dto.id, key: dto.key, name: dto.name, type: dto.type };
}
export async function listCategories(init?: RequestInit) {
    return (await runOrvalFetch(() => getCategories(init))).map(mapCategory);
}
export async function createCategory(input: CreateCategoryDto, init?: RequestInit) {
    return mapCategory(await runOrvalFetch(() => postCategories(input, init)));
}
