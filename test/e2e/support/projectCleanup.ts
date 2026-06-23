import type { APIRequestContext, Page } from '@playwright/test';

type ProjectCleanupRecord = Readonly<{ id: string; name: string }>;

const cleanupProjectNamesByPage = new WeakMap<Page, Set<string>>();
const createdCleanupProjectNameByPage = new WeakMap<Page, string>();

export const backendApiBaseUrl = () =>
    (process.env.E2E_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export function markProjectForCleanup(page: Page, projectName: string): void {
    const names = cleanupProjectNamesByPage.get(page) ?? new Set<string>();
    names.add(projectName);
    cleanupProjectNamesByPage.set(page, names);
    createdCleanupProjectNameByPage.set(page, projectName);
}

export function getCreatedCleanupProjectName(page: Page): string | undefined {
    return createdCleanupProjectNameByPage.get(page);
}

async function findProjectsByName(request: APIRequestContext, projectName: string): Promise<ProjectCleanupRecord[]> {
    const response = await request.get(`${backendApiBaseUrl()}/projects`);
    if (!response.ok()) return [];

    const projects = (await response.json()) as ProjectCleanupRecord[];
    return projects.filter((project) => project.name === projectName);
}

async function deleteProject(request: APIRequestContext, projectId: string): Promise<void> {
    const response = await request.delete(`${backendApiBaseUrl()}/projects/${projectId}`);
    if (![204, 404].includes(response.status())) {
        throw new Error(`Cleanup failed for project ${projectId}: ${response.status()} ${await response.text()}`);
    }
}

export async function cleanupProjectsForPage(page: Page, request: APIRequestContext): Promise<void> {
    const projectNames = cleanupProjectNamesByPage.get(page);
    if (!projectNames) return;

    try {
        for (const projectName of projectNames) {
            const projects = await findProjectsByName(request, projectName);
            await Promise.all(projects.map((project) => deleteProject(request, project.id)));
        }
    } finally {
        cleanupProjectNamesByPage.delete(page);
        createdCleanupProjectNameByPage.delete(page);
    }
}
