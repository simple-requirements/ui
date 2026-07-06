import { useLiveQuery } from '@tanstack/react-db';
import { useEffect, useMemo, useState } from 'react';

import { getProjectRequirementsCollection } from '@/api/collections/projectRequirementsCollection';

import type { RequirementTableRow } from '@/pages/ProjectRequirements/List/requirementListTypes';

export function useProjectRequirementsList(projectId: string | undefined) {
    const [selectedRequirementId, setSelectedRequirementId] = useState<string>();

    const requirementsCollection = useMemo(
        () => (projectId === undefined ? undefined : getProjectRequirementsCollection(projectId)),
        [projectId],
    );

    const requirementsQuery = useLiveQuery(
        (query) => {
            if (requirementsCollection === undefined) {
                return undefined;
            }

            return query.from({ requirements: requirementsCollection });
        },
        [requirementsCollection],
    );

    const requirements = useMemo<RequirementTableRow[]>(
        () => (requirementsQuery.data ?? []).map((requirement) => ({ ...requirement })),
        [requirementsQuery.data],
    );

    const selectedRequirement = useMemo(
        () => requirements.find((requirement) => requirement.id === selectedRequirementId) ?? requirements[0],
        [requirements, selectedRequirementId],
    );

    useEffect(() => {
        if (requirements.length === 0) {
            setSelectedRequirementId(undefined);

            return;
        }

        setSelectedRequirementId((currentSelectedRequirementId) => {
            const selectedRequirementStillExists = requirements.some(
                (requirement) => requirement.id === currentSelectedRequirementId,
            );

            return selectedRequirementStillExists ? currentSelectedRequirementId : requirements[0].id;
        });
    }, [requirements]);

    return { requirements, requirementsQuery, selectedRequirement, selectedRequirementId, setSelectedRequirementId };
}
