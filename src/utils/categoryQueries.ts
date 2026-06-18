import { useLiveQuery } from '@tanstack/react-db';
import { useEffect } from 'react';
import { useMutation, useQuery, type QueryClient } from '@tanstack/react-query';
import { categoryKeys } from '@/api/queryKeys';
import { createCategory, listCategories } from '@/features/categories/api/categoriesApi';
import { categoriesCollection, replaceCollectionRows, upsertCollectionRow } from '@/utils/dbCollections';
import type { Category } from '@/types/domain';

/** Loads global backend categories into a React DB collection independently from the selected project. */
export function useCategoriesQuery() {
    const query = useQuery({
        queryKey: categoryKeys.all,
        queryFn: ({ signal }) => listCategories({ signal }),
        retry: false,
    });
    const liveCategories = useLiveQuery(categoriesCollection);

    useEffect(() => {
        if (query.data) replaceCollectionRows(categoriesCollection, query.data);
    }, [query.data]);

    return { ...query, data: liveCategories.data as Category[] };
}

/** Persists a category, upserts it into the React DB collection, and invalidates the backend list cache. */
export function useCreateCategoryMutation(queryClient: QueryClient, onCreated: () => void) {
    return useMutation({
        mutationFn: createCategory,
        onSuccess: async (category) => {
            upsertCollectionRow(categoriesCollection, category);
            await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            onCreated();
        },
    });
}
