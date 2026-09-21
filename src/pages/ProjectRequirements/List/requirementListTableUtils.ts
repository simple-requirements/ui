import type { ColumnPassThroughOptions } from 'primereact/column';

import { isRequirementTableRow } from '@/pages/ProjectRequirements/List/requirementListTypes';

export function getRequirementRowClassName(requirement: unknown, selectedRequirementId: string | undefined): string {
    if (isRequirementTableRow(requirement) && requirement.id === selectedRequirementId) {
        return 'project-requirements-list-page__table-row project-requirements-list-page__table-row--selected';
    }

    return 'project-requirements-list-page__table-row';
}

export function getRequirementColumnPassThrough(columnClassName?: string): ColumnPassThroughOptions {
    const cellClassNames = [columnClassName];

    return {
        headerCell: {
            className: ['project-requirements-list-page__table-header-cell', ...cellClassNames]
                .filter((className) => className !== undefined)
                .join(' '),
        },
        bodyCell: {
            className: ['project-requirements-list-page__table-body-cell', ...cellClassNames]
                .filter((className) => className !== undefined)
                .join(' '),
        },
    };
}
