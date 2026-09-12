import type { ElementType } from 'react';

import type { Category } from '@/api/categoriesApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { formatDateTime } from '@/utils/displayFormatters';

import '@/pages/ProjectCategories/CategoryDetailsPanel.scss';

export type CategoryDetailsPanelProps = Readonly<{
    category?: Category;
    title: string;
    titleElement?: 'h1' | 'h2';
    titleId?: string;
    emptyMessage?: string;
}>;

/**
 * Returns the number of requirements assigned to a category.
 * @param category Category whose usage count is displayed.
 * @returns Related requirement count.
 */
function getRequirementCountForCategory(category: Category): number {
    return category.requirementCount ?? 0;
}

/**
 * Renders category metadata without local mutation actions.
 * @param props Category detail presentation properties.
 * @returns Category detail panel.
 */
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
            <div className='category-details-panel__header'>
                <TitleElement
                    id={titleId}
                    className='category-details-panel__title'>
                    {title}
                </TitleElement>
            </div>

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
