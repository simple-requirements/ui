import { useLiveQuery } from '@tanstack/react-db';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { useEffect, useMemo, useState } from 'react';

import { getProjectRequirementsCollection } from '@/api/collections/projectRequirementsCollection';
import { getMyReviewTasksQueryKey, listMyReviewTasks } from '@/api/reviewTasksApi';
import { useProjectPermissions } from '@/auth/projectPermissions';
import { authStore } from '@/stores/authStore';
import type { RequirementTableRow } from '@/pages/ProjectRequirements/List/requirementListTypes';

export function useProjectRequirementsList(projectId: string | undefined) {
    const [selectedRequirementId, setSelectedRequirementId] = useState<string>();
    const permissions = useProjectPermissions(projectId);
    const authenticatedUserId = useSelector(authStore, (state) => state.user?.id);
    const requirementsCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectRequirementsCollection(projectId)),
        [projectId],
    );
    const requirementsQuery = useLiveQuery(
        (query) =>
            requirementsCollection === undefined ? undefined : query.from({ requirements: requirementsCollection }),
        [requirementsCollection],
    );
    const requirements = useMemo<RequirementTableRow[]>(
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
        for (const requirement of requirements) {
            if (byId.has(requirement.categoryId)) continue;
            const [type, key] = requirement.visibleKey.split('-');
            if (type !== 'FR' && type !== 'NFR') continue;
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
    }, [requirements]);
    const myReviewTasksQuery = useQuery({
        queryKey: [...getMyReviewTasksQueryKey(projectId), authenticatedUserId],
        queryFn: () => (projectId === undefined ? Promise.resolve([]) : listMyReviewTasks(projectId)),
        enabled: projectId !== undefined && authenticatedUserId !== undefined && permissions.canManageRequirements,
        refetchOnMount: 'always',
    });
    const pendingReviewRequirementIds = useMemo(
        () =>
            permissions.canManageRequirements ?
                new Set(
                    (myReviewTasksQuery.data ?? [])
                        .filter((task) => task.status === 'pending')
                        .map((task) => task.requirementId),
                )
            :   new Set<string>(),
        [myReviewTasksQuery.data, permissions.canManageRequirements],
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
        categories,
        pendingReviewRequirementIds,
        requirements,
        requirementsQuery,
        selectedRequirement,
        selectedRequirementId,
        setSelectedRequirementId,
    };
}
