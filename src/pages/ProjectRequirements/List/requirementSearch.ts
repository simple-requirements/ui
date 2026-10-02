import type { Category } from '@/api/categoriesApi';
import type { RequirementLinksOverview } from '@/api/requirementLinksApi';
import type { Requirement } from '@/api/requirementsApi';

export type RequirementListView = 'table' | 'document';

export type RequirementSearchFilters = Readonly<{
    search: string;
    type: '' | 'FR' | 'NFR';
    categoryId: string;
    categoryKey: string;
    status: string;
    priority: string;
    owner: string;
    metricKey: string;
    linkedRequirementKey: string;
    unresolvedMetricsOnly: boolean;
    includeInactive: boolean;
}>;

export const emptyRequirementSearchFilters: RequirementSearchFilters = {
    search: '',
    type: '',
    categoryId: '',
    categoryKey: '',
    status: '',
    priority: '',
    owner: '',
    metricKey: '',
    linkedRequirementKey: '',
    unresolvedMetricsOnly: false,
    includeInactive: false,
};

function includesNormalized(value: string | null | undefined, needle: string): boolean {
    return (value ?? '').toLocaleLowerCase().includes(needle);
}

function matchesSearch(requirement: Requirement, search: string): boolean {
    const needle = search.trim().toLocaleLowerCase();
    if (needle.length === 0) return true;

    return [
        requirement.visibleKey,
        requirement.description,
        requirement.source,
        requirement.owner,
        requirement.status,
    ].some((value) => includesNormalized(value, needle));
}

function matchesMetric(requirement: Requirement, key: string): boolean {
    const normalized = key.trim().toUpperCase();
    if (normalized.length === 0) return true;
    return (requirement.metricReferences ?? []).some((reference) => reference.key.includes(normalized));
}

function matchesLinkedRequirement(overview: RequirementLinksOverview | undefined, key: string): boolean {
    const normalized = key.trim().toUpperCase();
    if (normalized.length === 0) return true;
    if (overview === undefined) return false;
    return [...overview.outgoing, ...overview.incoming].some(
        (link) => link.source.visibleKey.includes(normalized) || link.target.visibleKey.includes(normalized),
    );
}

/** Applies the first-release requirement search/filter rules to one project-local requirement list. */
export function filterRequirements(
    requirements: readonly Requirement[],
    categories: readonly Category[],
    linksByRequirementId: ReadonlyMap<string, RequirementLinksOverview>,
    filters: RequirementSearchFilters,
): Requirement[] {
    const categoriesById = new Map(categories.map((category) => [category.id, category]));
    const explicitStatus = filters.status.trim();

    return requirements.filter((requirement) => {
        const category = categoriesById.get(requirement.categoryId);
        const inactive = requirement.status === 'rejected' || requirement.status === 'obsolete';
        if (!filters.includeInactive && explicitStatus.length === 0 && inactive) return false;
        if (!matchesSearch(requirement, filters.search)) return false;
        if (filters.type !== '' && category?.type !== filters.type) return false;
        if (filters.categoryId !== '' && requirement.categoryId !== filters.categoryId) return false;
        if (filters.categoryKey !== '' && category?.key !== filters.categoryKey.toUpperCase()) return false;
        if (explicitStatus !== '' && requirement.status !== explicitStatus) return false;
        if (filters.priority !== '' && requirement.priority !== filters.priority) return false;
        if (
            filters.owner.trim() !== ''
            && !includesNormalized(requirement.owner, filters.owner.trim().toLocaleLowerCase())
        )
            return false;
        if (!matchesMetric(requirement, filters.metricKey)) return false;
        if (!matchesLinkedRequirement(linksByRequirementId.get(requirement.id), filters.linkedRequirementKey))
            return false;
        if (
            filters.unresolvedMetricsOnly
            && !(requirement.metricReferences ?? []).some((reference) => !reference.resolved)
        )
            return false;
        return true;
    });
}
