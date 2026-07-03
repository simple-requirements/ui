import type { ElementType } from 'react';

import type { Category } from '@/api/categoriesApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';

import '@/pages/ProjectCategories/CategoryDetailsPanel.scss';

export type CategoryDetailsPanelProps = Readonly<{
    category?: Category;
    title: string;
    titleElement?: 'h1' | 'h2';
    titleId?: string;
    emptyMessage?: string;
}>;

function formatDateTime(value: string): string {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function getRequirementCountForCategory(category: Category): number {
    return category.requirementCount;
}

export function CategoryDetailsPanel({
    category,
    title,
    titleElement = 'h2',
    titleId,
    emptyMessage = 'Select a category to show its details.',
}: CategoryDetailsPanelProps) {
    const TitleElement: ElementType = titleElement;

    return (
        <div
            className='category-details-panel'
            aria-live='polite'>
            <TitleElement
                id={titleId}
                className='category-details-panel__title'>
                {title}
            </TitleElement>

            {category === undefined ?
                <InlineStatus kind='empty'>{emptyMessage}</InlineStatus>
            :   <dl className='category-details-panel__details-list'>
                    <div className='category-details-panel__details-row'>
                        <dt>Name</dt>
                        <dd>{category.name}</dd>
                    </div>

                    <div className='category-details-panel__details-row'>
                        <dt>Key</dt>
                        <dd>{category.key}</dd>
                    </div>

                    <div className='category-details-panel__details-row'>
                        <dt>Type</dt>
                        <dd>{category.type}</dd>
                    </div>

                    <div className='category-details-panel__details-row'>
                        <dt>Related requirements</dt>
                        <dd>{getRequirementCountForCategory(category)}</dd>
                    </div>

                    <div className='category-details-panel__details-row'>
                        <dt>Created</dt>
                        <dd>{formatDateTime(category.createdAt)}</dd>
                    </div>

                    <div className='category-details-panel__details-row'>
                        <dt>Updated</dt>
                        <dd>{formatDateTime(category.updatedAt)}</dd>
                    </div>
                </dl>
            }
        </div>
    );
}
