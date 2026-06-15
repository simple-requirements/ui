import type { Category, DemoRequirementRepository } from '@/demo/demoTypes';

export interface CategoriesStoreState {
    categories: readonly Category[];
    loading: boolean;
    error: string | null;
}

export function createCategoriesStore(categoryRepository: Pick<DemoRequirementRepository, 'listCategories' | 'createCategory'>) {
    return {
        async loadCategories() {
            return [...(await categoryRepository.listCategories())];
        },
        async createCategory(input: Category) {
            return categoryRepository.createCategory(input);
        },
    };
}
