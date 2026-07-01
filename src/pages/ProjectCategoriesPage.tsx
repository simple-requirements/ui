import { useQuery } from '@tanstack/react-query';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import type { KeyboardEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { getListProjectCategoriesQueryKey, listProjectCategoriesRequest, type Category } from '@/api/categoriesApi';

import '@/pages/ProjectCategoriesPage.scss';

const EMPTY_CATEGORIES: readonly Category[] = [];

function getCategoryRowClassName(selected: boolean): string {
    return selected ?
            'project-categories-page__table-row project-categories-page__table-row--selected'
        :   'project-categories-page__table-row';
}

function formatDateTime(value: string): string {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function getRequirementCountForCategory(category: Category): number {
    return category.requirementCount;
}

export function ProjectCategoriesPage() {
    const { projectId } = useParams();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>();

    const categoryProjectId = projectId ?? '';

    const categoriesQuery = useQuery({
        queryKey: getListProjectCategoriesQueryKey(categoryProjectId),
        queryFn: () => listProjectCategoriesRequest(categoryProjectId),
        enabled: projectId !== undefined,
        retry: false,
    });

    const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;

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

            return selectedCategoryStillExists ? currentSelectedCategoryId : categories[0]?.id;
        });
    }, [categories]);

    function handleCategoryRowKeyDown(categoryId: string, event: KeyboardEvent<HTMLTableRowElement>): void {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        setSelectedCategoryId(categoryId);
    }

    if (projectId === undefined) {
        return (
            <section className='project-categories-page'>
                <p className='project-categories-page__status'>Project route is missing a project id.</p>
            </section>
        );
    }

    return (
        <section
            className='project-categories-page'
            aria-labelledby='project-categories-page-title'>
            <Splitter
                layout='vertical'
                className='project-categories-page__splitter'>
                <SplitterPanel
                    size={67}
                    minSize={25}
                    className='project-categories-page__splitter-panel'>
                    <div className='project-categories-page__list-panel'>
                        <header className='project-categories-page__header'>
                            <h1
                                id='project-categories-page-title'
                                className='project-categories-page__title'>
                                Categories
                            </h1>
                        </header>

                        {categoriesQuery.isLoading && (
                            <p className='project-categories-page__status'>Loading categories …</p>
                        )}

                        {categoriesQuery.isError && (
                            <p className='project-categories-page__status'>Categories could not be loaded.</p>
                        )}

                        {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length === 0 && (
                            <p className='project-categories-page__status'>No categories available.</p>
                        )}

                        {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length > 0 && (
                            <div className='project-categories-page__table-wrapper'>
                                <table className='project-categories-page__table'>
                                    <thead>
                                        <tr>
                                            <th scope='col'>Key</th>
                                            <th scope='col'>Type</th>
                                            <th scope='col'>Name</th>
                                            <th scope='col'>Requirements</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {categories.map((category) => (
                                            <tr
                                                key={category.id}
                                                tabIndex={0}
                                                className={getCategoryRowClassName(category.id === selectedCategoryId)}
                                                onClick={() => setSelectedCategoryId(category.id)}
                                                onKeyDown={(event) => handleCategoryRowKeyDown(category.id, event)}>
                                                <td>{category.key}</td>
                                                <td>{category.type}</td>
                                                <td>{category.name}</td>
                                                <td>{getRequirementCountForCategory(category)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </SplitterPanel>

                <SplitterPanel
                    size={33}
                    minSize={20}
                    className='project-categories-page__splitter-panel'>
                    <div
                        className='project-categories-page__details-panel'
                        aria-live='polite'>
                        <h2 className='project-categories-page__details-title'>Category details</h2>

                        {selectedCategory === undefined ?
                            <p className='project-categories-page__status'>Select a category to show its details.</p>
                        :   <dl className='project-categories-page__details-list'>
                                <div className='project-categories-page__details-row'>
                                    <dt>Name</dt>
                                    <dd>{selectedCategory.name}</dd>
                                </div>

                                <div className='project-categories-page__details-row'>
                                    <dt>Key</dt>
                                    <dd>{selectedCategory.key}</dd>
                                </div>

                                <div className='project-categories-page__details-row'>
                                    <dt>Type</dt>
                                    <dd>{selectedCategory.type}</dd>
                                </div>

                                <div className='project-categories-page__details-row'>
                                    <dt>Related requirements</dt>
                                    <dd>{getRequirementCountForCategory(selectedCategory)}</dd>
                                </div>

                                <div className='project-categories-page__details-row'>
                                    <dt>Created</dt>
                                    <dd>{formatDateTime(selectedCategory.createdAt)}</dd>
                                </div>

                                <div className='project-categories-page__details-row'>
                                    <dt>Updated</dt>
                                    <dd>{formatDateTime(selectedCategory.updatedAt)}</dd>
                                </div>
                            </dl>
                        }
                    </div>
                </SplitterPanel>
            </Splitter>
        </section>
    );
}
