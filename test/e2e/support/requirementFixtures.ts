import { E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN } from './e2eEnv';
import type { ImplementationTicket, Requirement } from './e2eTypes';
import { jsonRequestForToken, requestJson } from './realBackendClient';

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
        jsonRequestForToken(E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN, 'POST', requirementData),
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
        jsonRequestForToken(E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN, 'PATCH', data),
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
        jsonRequestForToken(E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN, 'POST', {
            ticketId,
            completedAt: '2026-09-02',
            completedBy: 'Requirements Engineer',
        }),
        201,
    );
}
