import { Store } from '@tanstack/react-store';
import type { Category, DemoRequirementRepository } from '@/demo/demoTypes';

/** Snapshot shape for category store subscriptions. */
export interface CategoriesStoreState {
    categories: readonly Category[];
    loading: boolean;
    error: string | null;
}

/** Creates category data operations backed by a TanStack-style store and the replaceable demo repository boundary. */
export function createCategoriesStore(
    categoryRepository: Pick<DemoRequirementRepository, 'listCategories' | 'createCategory'>,
) {
    const store = new Store<CategoriesStoreState>({ categories: [], loading: false, error: null });

    return {
        store,
        async loadCategories() {
            store.setState((currentState) => ({ ...currentState, loading: true, error: null }));
            try {
                const categories = [...(await categoryRepository.listCategories())];
                store.setState(() => ({ categories, loading: false, error: null }));
                return categories;
            } catch (error) {
                store.setState((currentState) => ({
                    ...currentState,
                    loading: false,
                    error: (error as Error).message,
                }));
                throw error;
            }
        },
        async createCategory(input: Category) {
            return categoryRepository.createCategory(input);
        },
    };
}
