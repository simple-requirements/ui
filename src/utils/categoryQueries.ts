import { useMutation, useQuery, type QueryClient } from '@tanstack/react-query';
import { categoryKeys } from '@/api/queryKeys';
import { createCategory, listCategories } from '@/features/categories/api/categoriesApi';

/** Loads global backend categories independently from the selected project. */
export function useCategoriesQuery() {
    return useQuery({ queryKey: categoryKeys.all, queryFn: ({ signal }) => listCategories({ signal }), retry: false });
}

/** Persists a category and invalidates the global category list cache. */
export function useCreateCategoryMutation(queryClient: QueryClient, onCreated: () => void) {
    return useMutation({
        mutationFn: createCategory,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            onCreated();
        },
    });
}
