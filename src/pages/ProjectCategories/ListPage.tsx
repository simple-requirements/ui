import { useLiveQuery } from '@tanstack/react-db';
import { Column, type ColumnPassThroughOptions } from 'primereact/column';
import { DataTable, type DataTableRowClickEvent, type DataTableSelectionSingleChangeEvent } from 'primereact/datatable';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import type { Category } from '@/api/categoriesApi';
import { getProjectCategoriesCollection } from '@/api/collections/projectCategoriesCollection';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { LoadableContent } from '@/components/Feedback/LoadableContent';
import { getProjectCategoryDetailsRoute } from '@/router/projectRoutes';
import { openTab } from '@/stores/tabBarStore';

import { CategoryDetailsPanel } from '@/pages/ProjectCategories/CategoryDetailsPanel';

import '@/pages/ProjectCategories/ListPage.scss';

type CategoryTableRow = Category & Record<string, unknown>;

function isCategoryTableRow(value: unknown): value is CategoryTableRow {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return 'id' in value && 'key' in value;
}

function getCategoryRowClassName(category: unknown, selectedCategoryId: string | undefined): string {
    if (isCategoryTableRow(category) && category.id === selectedCategoryId) {
        return 'project-categories-list-page__table-row project-categories-list-page__table-row--selected';
    }

    return 'project-categories-list-page__table-row';
}

function getRequirementCountForCategory(category: Category): number {
    return category.requirementCount;
}

function requirementCountBodyTemplate(category: CategoryTableRow): number {
    return getRequirementCountForCategory(category);
}

function getColumnPassThrough(columnClassName?: string): ColumnPassThroughOptions {
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

export function ListPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>();

    const categoriesCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectCategoriesCollection(projectId)),
        [projectId],
    );

    const categoriesQuery = useLiveQuery(
        (query) => {
            if (categoriesCollection === undefined) {
                return undefined;
            }

            return query.from({ categories: categoriesCollection });
        },
        [categoriesCollection],
    );
    const categories = useMemo<CategoryTableRow[]>(
        () => (categoriesQuery.data ?? []).map((category) => ({ ...category })),
        [categoriesQuery.data],
    );

    const selectedCategory = useMemo(
        () => categories.find((category) => category.id === selectedCategoryId),
        [categories, selectedCategoryId],
    );

    useEffect(() => {
        if (categories.length === 0) {
            setSelectedCategoryId(undefined);

            return;
        }

        setSelectedCategoryId((currentSelectedCategoryId) => {
            const selectedCategoryStillExists = categories.some(
                (category) => category.id === currentSelectedCategoryId,
            );

            return selectedCategoryStillExists ? currentSelectedCategoryId : categories[0].id;
        });
    }, [categories]);

    function handleCategorySelectionChange(event: DataTableSelectionSingleChangeEvent<CategoryTableRow[]>): void {
        setSelectedCategoryId(event.value.id);
    }

    function handleCategoryRowDoubleClick(event: DataTableRowClickEvent): void {
        if (!isCategoryTableRow(event.data) || projectId === undefined) {
            return;
        }

        const categoryDetailsRoute = getProjectCategoryDetailsRoute(projectId, event.data.id);

        setSelectedCategoryId(event.data.id);

        openTab({ id: categoryDetailsRoute, label: `Category ${event.data.key}`, closable: true });

        void navigate(categoryDetailsRoute);
    }

    if (projectId === undefined) {
        return (
            <section className='project-categories-list-page'>
                <InlineStatus kind='error'>Project route is missing a project id.</InlineStatus>
            </section>
        );
    }

    return (
        <section
            className='project-categories-list-page'
            aria-labelledby='project-categories-list-page-title'>
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
                            <DataTable
                                value={categories}
                                dataKey='id'
                                selectionMode='single'
                                metaKeySelection={false}
                                selection={selectedCategory ?? null}
                                onSelectionChange={handleCategorySelectionChange}
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
                                    pt={getColumnPassThrough('project-categories-list-page__key-column')}
                                />

                                <Column
                                    field='type'
                                    header='Type'
                                    pt={getColumnPassThrough('project-categories-list-page__type-column')}
                                />

                                <Column
                                    field='name'
                                    header='Name'
                                    pt={getColumnPassThrough()}
                                />

                                <Column
                                    header='Requirements'
                                    body={requirementCountBodyTemplate}
                                    pt={getColumnPassThrough('project-categories-list-page__requirements-column')}
                                />
                            </DataTable>
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
                    />
                </SplitterPanel>
            </Splitter>
        </section>
    );
}
