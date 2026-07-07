import { Splitter, SplitterPanel } from 'primereact/splitter';

import { LoadableContent } from '@/components/Feedback/LoadableContent';

import { CategoryDetailsPanel } from '@/pages/ProjectCategories/CategoryDetailsPanel';
import { CategoryTable } from '@/pages/ProjectCategories/List/CategoryTable';
import type { CategoryTableRow } from '@/pages/ProjectCategories/List/categoryListTypes';
import type { CategoryListController } from '@/pages/ProjectCategories/List/useCategoryListController';
import type { useProjectCategoriesList } from '@/pages/ProjectCategories/List/useProjectCategoriesList';

type ProjectCategoriesListState = ReturnType<typeof useProjectCategoriesList>;

type CategoryListPanelsProps = Readonly<{
    categories: readonly CategoryTableRow[];
    categoriesQuery: ProjectCategoriesListState['categoriesQuery'];
    selectedCategory: CategoryTableRow | undefined;
    selectedCategoryId: string | undefined;
    setSelectedCategoryId: ProjectCategoriesListState['setSelectedCategoryId'];
    controller: CategoryListController;
}>;

export function CategoryListPanels({
    categories,
    categoriesQuery,
    selectedCategory,
    selectedCategoryId,
    setSelectedCategoryId,
    controller,
}: CategoryListPanelsProps) {
    return (
        <Splitter
            layout='vertical'
            pt={{ root: { className: 'project-categories-list-page__splitter' } }}>
            <SplitterPanel
                size={67}
                minSize={25}
                pt={{ root: { className: 'project-categories-list-page__splitter-panel' } }}>
                <div className='project-categories-list-page__list-panel'>
                    <header className='project-categories-list-page__header'>
                        <h1
                            id='project-categories-list-page-title'
                            className='project-categories-list-page__title'>
                            Categories
                        </h1>
                    </header>

                    <LoadableContent
                        loading={categoriesQuery.isLoading}
                        error={categoriesQuery.isError}
                        empty={categories.length === 0}
                        loadingMessage='Loading categories …'
                        errorMessage='Categories could not be loaded.'
                        emptyMessage='No categories available.'>
                        <CategoryTable
                            categories={categories}
                            selectedCategory={selectedCategory}
                            selectedCategoryId={selectedCategoryId}
                            onSelectCategory={setSelectedCategoryId}
                            onCopyCategoryKey={(category) => {
                                void controller.copyCategoryKey(category);
                            }}
                            onOpenCategory={controller.openCategory}
                            onOpenContextMenu={controller.openContextMenu}
                        />
                    </LoadableContent>
                </div>
            </SplitterPanel>

            <SplitterPanel
                size={33}
                minSize={20}
                pt={{ root: { className: 'project-categories-list-page__splitter-panel' } }}>
                <CategoryDetailsPanel
                    category={selectedCategory}
                    title='Category details'
                    onEditCategory={controller.editCategory}
                />
            </SplitterPanel>
        </Splitter>
    );
}
