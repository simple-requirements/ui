import type { Category, DemoRequirementRepository } from '@/demo/demoTypes';

/** Snapshot shape for future category store subscriptions. */
export interface CategoriesStoreState {
    categories: readonly Category[];
    loading: boolean;
    error: string | null;
}

/** Creates category data operations backed by the replaceable demo repository boundary. */
export function createCategoriesStore(
    categoryRepository: Pick<DemoRequirementRepository, 'listCategories' | 'createCategory'>,
) {
    return {
        async loadCategories() {
            return [...(await categoryRepository.listCategories())];
        },
        async createCategory(input: Category) {
            return categoryRepository.createCategory(input);
        },
    };
}
