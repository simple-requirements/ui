import type { ImplementationTicket, Requirement } from './e2eTypes';
import { jsonRequest, requestJson } from './realBackendClient';

export async function createTestRequirement(
    projectId: string,
    requirementData: Readonly<{
        categoryId: string;
        description: string | null;
        priority: string | null;
        owner: string | null;
        rationale: string | null;
        source: string | null;
    }>,
): Promise<Requirement> {
    return requestJson<Requirement>(
        `/projects/${encodeURIComponent(projectId)}/requirements`,
        jsonRequest('POST', requirementData),
        201,
    );
}

export async function updateRequirementStatus(
    projectId: string,
    requirementId: string,
    data: Record<string, unknown>,
): Promise<Requirement> {
    return requestJson<Requirement>(
        `/projects/${encodeURIComponent(projectId)}/requirements/${encodeURIComponent(requirementId)}`,
        jsonRequest('PATCH', data),
        200,
    );
}

export async function createImplementationTicket(
    projectId: string,
    requirementId: string,
    ticketId: string,
): Promise<ImplementationTicket> {
    return requestJson<ImplementationTicket>(
        `/projects/${encodeURIComponent(projectId)}/requirements/${encodeURIComponent(requirementId)}/implementation-tickets`,
        jsonRequest('POST', { ticketId, completedAt: '2026-09-02', completedBy: 'E2E Requirements Engineer' }),
        201,
    );
}
