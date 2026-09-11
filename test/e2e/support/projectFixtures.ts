import { E2E_ADMIN_USER_ID } from "./e2eEnv";
import type { Project } from "./e2eTypes";
import { setProjectMembership } from "./membershipFixtures";
import {
  authenticatedHeaders,
  jsonRequest,
  requestEmpty,
  requestJson,
} from "./realBackendClient";

export async function resetTestBackend(): Promise<void> {
  const projects = await listTestProjects();
  for (const project of projects) {
    await deleteTestProject(project.id);
  }
}

export async function listTestProjects(): Promise<Project[]> {
  return requestJson<Project[]>("/projects", {}, 200);
}

export async function createTestProject(projectName: string): Promise<Project> {
  const project = await requestJson<Project>(
    "/projects",
    jsonRequest("POST", { name: projectName }),
    201,
  );
  await setProjectMembership(project.id, E2E_ADMIN_USER_ID, [
    "requirements_engineer",
    "developer",
    "viewer",
  ]);
  return project;
}

export async function updateTestProject(
  projectId: string,
  name: string,
): Promise<Project> {
  return requestJson<Project>(
    `/projects/${encodeURIComponent(projectId)}`,
    jsonRequest("PATCH", { name }),
    200,
  );
}

export async function deleteTestProject(projectId: string): Promise<void> {
  await requestEmpty(
    `/projects/${encodeURIComponent(projectId)}`,
    { method: "DELETE", headers: authenticatedHeaders() },
    [204, 404],
  );
}
