import type { ElementType } from 'react';

import type { Requirement } from '@/api/requirementsApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { RequirementDetailsList } from '@/pages/ProjectRequirements/RequirementDetailsPanel/RequirementDetailsList';

import '@/pages/ProjectRequirements/RequirementDetailsPanel.scss';

export type RequirementDetailsPanelProps = Readonly<{
    requirement?: Requirement;
    title: string;
    titleElement?: 'h1' | 'h2';
    titleId?: string;
    emptyMessage?: string;
}>;

export function RequirementDetailsPanel({
    requirement,
    title,
    titleElement = 'h2',
    titleId,
    emptyMessage = 'Select a requirement to show its details.',
}: RequirementDetailsPanelProps) {
    const TitleElement: ElementType = titleElement;

    return (
        <div
            className='requirement-details-panel'
            aria-live='polite'>
            <div className='requirement-details-panel__header'>
                <TitleElement
                    id={titleId}
                    className='requirement-details-panel__title'>
                    {title}
                </TitleElement>
            </div>

            {requirement === undefined ?
                <InlineStatus kind='empty'>{emptyMessage}</InlineStatus>
            :   <RequirementDetailsList requirement={requirement} />}
        </div>
    );
}
