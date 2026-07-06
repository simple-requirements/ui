import type { Category } from '@/api/categoriesApi';

export type CategoryTableRow = Category & Readonly<{ requirementCount: number }> & Record<string, unknown>;

export function isCategoryTableRow(value: unknown): value is CategoryTableRow {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return 'id' in value && 'key' in value && 'requirementCount' in value;
}

export function canDeleteCategory(category: Pick<CategoryTableRow, 'requirementCount'>): boolean {
    return category.requirementCount === 0;
}
