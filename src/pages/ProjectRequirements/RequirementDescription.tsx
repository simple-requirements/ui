import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router';

import type { Requirement, RequirementMetricReference } from '@/api/requirementsApi';
import { getProjectMetricDetailsRoute } from '@/router/projectRoutes';

import '@/pages/ProjectRequirements/RequirementDescription.scss';

const metricPlaceholderPattern = /\[~(MET-[0-9]{4})\]/gu;

export type RequirementDescriptionProps = Readonly<{
    requirement: Requirement;
    stopNavigationPropagation?: boolean;
}>;

function stopPropagation(event: MouseEvent<HTMLAnchorElement>): void {
    event.stopPropagation();
}

function renderMetricReference(
    requirement: Requirement,
    reference: RequirementMetricReference,
    occurrence: number,
    stopNavigationPropagation: boolean,
): ReactNode {
    if (!reference.resolved || reference.metricId === null || reference.value === null) {
        return (
            <span
                key={`${reference.key}-${String(occurrence)}`}
                className='requirement-metric-reference requirement-metric-reference--unresolved'
                title={`Unresolved metric reference ${reference.key}`}>
                [~{reference.key}]
            </span>
        );
    }

    return (
        <Link
            key={`${reference.key}-${String(occurrence)}`}
            className='requirement-metric-reference requirement-metric-reference--resolved'
            to={getProjectMetricDetailsRoute(requirement.projectId, reference.metricId)}
            title={`${reference.key}${reference.active === false ? ' (deactivated)' : ''}: ${reference.value}`}
            aria-label={`${reference.key}: ${reference.value}. Open metric details.`}
            onClick={stopNavigationPropagation ? stopPropagation : undefined}>
            {reference.value}
        </Link>
    );
}

/** Renders current metric placeholders as linked values while keeping historical revisions frozen. */
export function RequirementDescription({ requirement, stopNavigationPropagation = false }: RequirementDescriptionProps) {
    if (requirement.metricReferences === undefined) {
        return <>{requirement.renderedDescription ?? requirement.description ?? '—'}</>;
    }

    if (requirement.description === null) return <>—</>;

    const referencesByKey = new Map(requirement.metricReferences.map((reference) => [reference.key, reference]));
    const nodes: ReactNode[] = [];
    let cursor = 0;
    let occurrence = 0;

    for (const match of requirement.description.matchAll(metricPlaceholderPattern)) {
        const key = match[1];
        const index = match.index ?? cursor;
        if (key === undefined) continue;
        const reference = referencesByKey.get(key);
        if (reference === undefined) continue;

        if (index > cursor) nodes.push(requirement.description.slice(cursor, index));
        nodes.push(renderMetricReference(requirement, reference, occurrence, stopNavigationPropagation));
        cursor = index + match[0].length;
        occurrence += 1;
    }

    if (cursor < requirement.description.length) nodes.push(requirement.description.slice(cursor));
    return <>{nodes.length === 0 ? requirement.description : nodes}</>;
}
