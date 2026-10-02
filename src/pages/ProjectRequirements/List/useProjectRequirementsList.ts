import { useLiveQuery } from '@tanstack/react-db';
import { useQueries } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { getProjectRequirementsCollection } from '@/api/collections/projectRequirementsCollection';
import {
    getRequirementLinksQueryKey,
    getRequirementLinksRequest,
    type RequirementLinksOverview,
} from '@/api/requirementLinksApi';
import type { RequirementTableRow } from '@/pages/ProjectRequirements/List/requirementListTypes';
import {
    emptyRequirementSearchFilters,
    filterRequirements,
    type RequirementListView,
    type RequirementSearchFilters,
} from '@/pages/ProjectRequirements/List/requirementSearch';

const defaultVisibleColumns = new Set([
    'description',
    'type',
    'category',
    'status',
    'priority',
    'owner',
    'reviewer',
    'updatedAt',
]);

export function useProjectRequirementsList(projectId: string | undefined) {
    const [selectedRequirementId, setSelectedRequirementId] = useState<string>();
    const [filters, setFilters] = useState<RequirementSearchFilters>(emptyRequirementSearchFilters);
    const [view, setView] = useState<RequirementListView>('table');
    const [visibleColumns, setVisibleColumns] = useState<ReadonlySet<string>>(defaultVisibleColumns);

    const requirementsCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectRequirementsCollection(projectId)),
        [projectId],
    );
    const requirementsQuery = useLiveQuery(
        (query) =>
            requirementsCollection === undefined ? undefined : query.from({ requirements: requirementsCollection }),
        [requirementsCollection],
    );
    const allRequirements = useMemo<RequirementTableRow[]>(
        () => (requirementsQuery.data ?? []).map((requirement) => ({ ...requirement })),
        [requirementsQuery.data],
    );
    const categories = useMemo(() => {
        const byId = new Map<
            string,
            {
                id: string;
                projectId: string;
                name: string;
                key: string;
                type: 'FR' | 'NFR';
                createdAt: string;
                updatedAt: string;
            }
        >();
        for (const requirement of allRequirements) {
            if (byId.has(requirement.categoryId)) continue;
            const [type, key] = requirement.visibleKey.split('-');
            if ((type !== 'FR' && type !== 'NFR') || key === undefined) continue;
            byId.set(requirement.categoryId, {
                id: requirement.categoryId,
                projectId: requirement.projectId,
                name: key,
                key,
                type,
                createdAt: requirement.createdAt,
                updatedAt: requirement.updatedAt,
            });
        }
        return [...byId.values()];
    }, [allRequirements]);

    const linkQueries = useQueries({
        queries:
            projectId === undefined ?
                []
            :   allRequirements.map((requirement) => ({
                    queryKey: getRequirementLinksQueryKey(projectId, requirement.id),
                    queryFn: () => getRequirementLinksRequest(projectId, requirement.id),
                    staleTime: 30_000,
                })),
    });
    const linksByRequirementId = useMemo(() => {
        const result = new Map<string, RequirementLinksOverview>();
        allRequirements.forEach((requirement, index) => {
            const data = linkQueries[index].data;
            if (data !== undefined) result.set(requirement.id, data);
        });
        return result;
    }, [allRequirements, linkQueries]);

    const requirements = useMemo<RequirementTableRow[]>(
        () =>
            filterRequirements(allRequirements, categories, linksByRequirementId, filters).map((requirement) => ({
                ...requirement,
            })),
        [allRequirements, categories, filters, linksByRequirementId],
    );

    const selectedRequirement = useMemo(
        () => requirements.find((requirement) => requirement.id === selectedRequirementId) ?? requirements.at(0),
        [requirements, selectedRequirementId],
    );

    useEffect(() => {
        if (requirements.length === 0) {
            setSelectedRequirementId(undefined);
            return;
        }
        setSelectedRequirementId((currentSelectedRequirementId) =>
            requirements.some((requirement) => requirement.id === currentSelectedRequirementId) ?
                currentSelectedRequirementId
            :   requirements[0].id,
        );
    }, [requirements]);

    return {
        allRequirements,
        categories,
        filters,
        linksByRequirementId,
        requirements,
        requirementsQuery,
        selectedRequirement,
        selectedRequirementId,
        setFilters,
        setSelectedRequirementId,
        setView,
        setVisibleColumns,
        view,
        visibleColumns,
    };
}
