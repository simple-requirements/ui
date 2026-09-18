import { E2E_REQUIREMENTS_ENGINEER_USER_ID } from './e2eEnv';
import type { Project } from './e2eTypes';
import { setProjectMembership } from './membershipFixtures';
import { authenticatedHeaders, jsonRequest, requestEmpty, requestJson } from './realBackendClient';

const projectNameAliases = new Map<string, string>();
const persistentProjectRunId = `${Date.now().toString(36)}-${process.pid.toString(36)}`;
let persistentProjectSequence = 0;

/**
 * Removes projects that are still deletable under the production retention rules.
 *
 * Requirements are retained permanently, so projects containing requirements cannot be
 * deleted merely to reset E2E state. Tests that create retained requirement data must use
 * unique persistent project names and isolate themselves by the created project id.
 */
export async function resetTestBackend(): Promise<void> {
    const projects = await listTestProjects();
    for (const project of projects) {
        if (project.requirementCount > 0) continue;
        await deleteTestProject(project.id);
    }
}

export async function listTestProjects(): Promise<Project[]> {
    return requestJson<Project[]>('/admin/projects', {}, 200);
}

export async function createTestProject(projectName: string): Promise<Project> {
    const project = await requestJson<Project>('/admin/projects', jsonRequest('POST', { name: projectName }), 201);
    await setProjectMembership(project.id, E2E_REQUIREMENTS_ENGINEER_USER_ID);
    projectNameAliases.set(projectName, projectName);
    return project;
}

/**
 * Creates a uniquely named project for scenarios that intentionally create retained requirements.
 * The logical feature name remains resolvable through {@link resolveTestProjectName}.
 */
export async function createPersistentTestProject(projectName: string): Promise<Project> {
    persistentProjectSequence += 1;
    const uniqueName = `${projectName} -- e2e-${persistentProjectRunId}-${persistentProjectSequence.toString(36)}`;
    projectNameAliases.set(projectName, uniqueName);
    return createTestProject(uniqueName);
}

/** Resolves a logical feature project name to the unique name used by the current E2E scenario. */
export function resolveTestProjectName(projectName: string): string {
    return projectNameAliases.get(projectName) ?? projectName;
}

export async function updateTestProject(projectId: string, name: string): Promise<Project> {
    return requestJson<Project>(
        `/admin/projects/${encodeURIComponent(projectId)}`,
        jsonRequest('PATCH', { name }),
        200,
    );
}

export async function deleteTestProject(projectId: string): Promise<void> {
    await requestEmpty(
        `/admin/projects/${encodeURIComponent(projectId)}`,
        { method: 'DELETE', headers: authenticatedHeaders() },
        [204, 404],
    );
}
