import type { ColumnPassThroughOptions } from 'primereact/column';

import { isCategoryTableRow } from '@/pages/ProjectCategories/List/categoryListTypes';

export function getCategoryRowClassName(category: unknown, selectedCategoryId: string | undefined): string {
    if (isCategoryTableRow(category) && category.id === selectedCategoryId) {
        return 'project-categories-list-page__table-row project-categories-list-page__table-row--selected';
    }

    return 'project-categories-list-page__table-row';
}

export function getCategoryColumnPassThrough(columnClassName?: string): ColumnPassThroughOptions {
    const cellClassNames = [columnClassName];

    return {
        headerCell: {
            className: ['project-categories-list-page__table-header-cell', ...cellClassNames]
                .filter((className) => className !== undefined)
                .join(' '),
        },
        bodyCell: {
            className: ['project-categories-list-page__table-body-cell', ...cellClassNames]
                .filter((className) => className !== undefined)
                .join(' '),
        },
    };
}
