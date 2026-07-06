import { Column } from 'primereact/column';
import { DataTable, type DataTableRowClickEvent, type DataTableSelectionSingleChangeEvent } from 'primereact/datatable';
import type { MouseEvent, ReactNode } from 'react';

import type { CategoryTableRow } from '@/pages/ProjectCategories/List/categoryListTypes';
import { isCategoryTableRow } from '@/pages/ProjectCategories/List/categoryListTypes';
import {
    getCategoryColumnPassThrough,
    getCategoryRowClassName,
} from '@/pages/ProjectCategories/List/categoryListTableUtils';

export type CategoryTableProps = Readonly<{
    categories: readonly CategoryTableRow[];
    selectedCategory: CategoryTableRow | undefined;
    selectedCategoryId: string | undefined;
    onSelectCategory: (categoryId: string | undefined) => void;
    onCopyCategoryKey: (category: CategoryTableRow) => void;
    onOpenCategory: (category: CategoryTableRow) => void;
    onOpenContextMenu: (category: CategoryTableRow, event: MouseEvent) => void;
}>;

function requirementCountBodyTemplate(category: CategoryTableRow): number {
    return category.requirementCount;
}

export function CategoryTable({
    categories,
    selectedCategory,
    selectedCategoryId,
    onSelectCategory,
    onCopyCategoryKey,
    onOpenCategory,
    onOpenContextMenu,
}: CategoryTableProps) {
    function handleCategorySelectionChange(event: DataTableSelectionSingleChangeEvent<CategoryTableRow[]>): void {
        onSelectCategory(isCategoryTableRow(event.value) ? event.value.id : undefined);
    }

    function handleCategoryRowDoubleClick(event: DataTableRowClickEvent): void {
        if (isCategoryTableRow(event.data)) {
            onOpenCategory(event.data);
        }
    }

    function keyBodyTemplate(category: CategoryTableRow): ReactNode {
        return (
            <a
                href={`#copy-category-key-${category.id}`}
                className='project-categories-list-page__key-copy-link'
                aria-label={`Copy category key ${category.key}`}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onSelectCategory(category.id);
                    onCopyCategoryKey(category);
                }}>
                {category.key}
            </a>
        );
    }

    return (
        <DataTable
            value={[...categories]}
            dataKey='id'
            selectionMode='single'
            metaKeySelection={false}
            selection={selectedCategory ?? null}
            onSelectionChange={handleCategorySelectionChange}
            onContextMenu={(event) => {
                if (!isCategoryTableRow(event.data)) {
                    return;
                }

                onSelectCategory(event.data.id);
                onOpenContextMenu(event.data, event.originalEvent);
            }}
            onRowDoubleClick={handleCategoryRowDoubleClick}
            rowClassName={(category) => getCategoryRowClassName(category, selectedCategoryId)}
            pt={{
                root: { className: 'project-categories-list-page__data-table' },
                wrapper: { className: 'project-categories-list-page__data-table-wrapper' },
                table: { className: 'project-categories-list-page__table' },
            }}
            scrollable
            scrollHeight='flex'>
            <Column
                field='key'
                header='Key'
                body={keyBodyTemplate}
                pt={getCategoryColumnPassThrough('project-categories-list-page__key-column')}
            />

            <Column
                field='type'
                header='Type'
                pt={getCategoryColumnPassThrough('project-categories-list-page__type-column')}
            />

            <Column
                field='name'
                header='Name'
                pt={getCategoryColumnPassThrough()}
            />

            <Column
                header='Requirements'
                body={requirementCountBodyTemplate}
                pt={getCategoryColumnPassThrough('project-categories-list-page__requirements-column')}
            />
        </DataTable>
    );
}
