import { runOrvalFetch } from '@/api/client/config';
import { getCategories, postCategories } from '@/api/generated/endpoints/categories/categories';
import type { CategoryResponseDto, CreateCategoryDto } from '@/api/generated/models';
import type { Category } from '@/types/domain';

/** Maps the generated category DTO into the UI category view model. */
export function mapCategory(dto: CategoryResponseDto): Category {
    return { id: dto.id, key: dto.key, name: dto.name, type: dto.type };
}

/** Lists global categories using the backend path described by the OpenAPI contract. */
export function listCategories(init?: RequestInit): Promise<Category[]> {
    return runOrvalFetch(() => getCategories(init)).then((categories) => categories.map(mapCategory));
}

/** Creates a global category using the generated request and response DTO types. */
export function createCategory(input: CreateCategoryDto, init?: RequestInit): Promise<Category> {
    return runOrvalFetch(() => postCategories(input, init)).then(mapCategory);
}
