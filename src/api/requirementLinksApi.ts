import { z } from 'zod';

import { apiFetch } from '@/api/fetch';
import { requirementStatusSchema } from '@/api/requirementsApi';

export const requirementLinkEndpointSchema = z.object({
    requirementId: z.uuid(),
    visibleKey: z.string().regex(/^(FR|NFR)-[A-Z]{2,4}-[0-9]{4}$/u),
    type: z.enum(['FR', 'NFR']),
    categoryId: z.uuid(),
    categoryName: z.string().min(1),
    status: requirementStatusSchema,
});

export const requirementLinkSchema = z.object({
    id: z.uuid(),
    projectId: z.uuid(),
    relationshipType: z.literal('references'),
    source: requirementLinkEndpointSchema,
    target: requirementLinkEndpointSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export const requirementLinksOverviewSchema = z.object({
    outgoing: z.array(requirementLinkSchema),
    incoming: z.array(requirementLinkSchema),
});

export type RequirementLink = z.infer<typeof requirementLinkSchema>;
export type RequirementLinksOverview = z.infer<typeof requirementLinksOverviewSchema>;

export function getRequirementLinksQueryKey(projectId: string | undefined, requirementId: string | undefined) {
    return ['projects', projectId, 'requirements', requirementId, 'links'] as const;
}

function baseUrl(projectId: string, requirementId: string): string {
    return `/projects/${projectId}/requirements/${requirementId}/links`;
}

export async function getRequirementLinksRequest(
    projectId: string,
    requirementId: string,
): Promise<RequirementLinksOverview> {
    const response = await apiFetch<{ data: unknown }>(baseUrl(projectId, requirementId));
    return requirementLinksOverviewSchema.parse(response.data);
}

export async function createRequirementLinkRequest(
    projectId: string,
    requirementId: string,
    targetKey: string,
): Promise<RequirementLink> {
    const response = await apiFetch<{ data: unknown }>(baseUrl(projectId, requirementId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetKey }),
    });
    return requirementLinkSchema.parse(response.data);
}

export async function updateRequirementLinkRequest(
    projectId: string,
    requirementId: string,
    linkId: string,
    targetKey: string,
): Promise<RequirementLink> {
    const response = await apiFetch<{ data: unknown }>(`${baseUrl(projectId, requirementId)}/${linkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetKey }),
    });
    return requirementLinkSchema.parse(response.data);
}

export async function deleteRequirementLinkRequest(
    projectId: string,
    requirementId: string,
    linkId: string,
): Promise<void> {
    await apiFetch(`${baseUrl(projectId, requirementId)}/${linkId}`, { method: 'DELETE' });
}
