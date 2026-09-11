import { expect, type Page } from "@playwright/test";

const DEFAULT_API_BASE_URL = "http://localhost:3000";
export const API_BASE_URL =
  process.env.E2E_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

export const E2E_ACCESS_TOKEN =
  process.env.E2E_ACCESS_TOKEN ?? "e2e-authentication-token";
export const E2E_ADMIN_USER_ID =
  process.env.E2E_ADMIN_USER_ID ?? "10000000-0000-4000-8000-000000000001";
export const E2E_LOGIN_USERNAME = process.env.E2E_LOGIN_USERNAME ?? "e2e-admin";
export const E2E_LOGIN_PASSWORD =
  process.env.E2E_LOGIN_PASSWORD ?? "correct horse battery staple";
export const E2E_REQUIREMENTS_ENGINEER_USER_ID =
  process.env.E2E_REQUIREMENTS_ENGINEER_USER_ID ??
  "10000000-0000-4000-8000-000000000002";
export const E2E_DEVELOPER_USER_ID =
  process.env.E2E_DEVELOPER_USER_ID ?? "10000000-0000-4000-8000-000000000003";
export const E2E_VIEWER_USER_ID =
  process.env.E2E_VIEWER_USER_ID ?? "10000000-0000-4000-8000-000000000004";
export const E2E_REQUIREMENTS_ENGINEER_ACCESS_TOKEN =
  process.env.E2E_REQUIREMENTS_ENGINEER_TOKEN ??
  "e2e-requirements-engineer-token";
export const E2E_DEVELOPER_ACCESS_TOKEN =
  process.env.E2E_DEVELOPER_TOKEN ?? "e2e-developer-token";
export const E2E_VIEWER_ACCESS_TOKEN =
  process.env.E2E_VIEWER_TOKEN ?? "e2e-viewer-token";
export const E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME =
  process.env.E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME ??
  "e2e-requirements-engineer";
export const E2E_DEVELOPER_LOGIN_USERNAME =
  process.env.E2E_DEVELOPER_LOGIN_USERNAME ?? "e2e-developer";
export const E2E_VIEWER_LOGIN_USERNAME =
  process.env.E2E_VIEWER_LOGIN_USERNAME ?? "e2e-viewer";

export type ProjectRole = "requirements_engineer" | "developer" | "viewer";

export type Project = Readonly<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  requirementCount?: number;
  ticketUrlTemplate?: string | null;
}>;

export type Category = Readonly<{
  id: string;
  projectId: string;
  name: string;
  key: string;
  type: "FR" | "NFR";
  createdAt: string;
  updatedAt: string;
  requirementCount?: number;
}>;

export type Requirement = Readonly<{
  id: string;
  projectId: string;
  categoryId: string;
  sequenceNumber: number;
  revisionNumber: number;
  visibleKey: string;
  status: "draft" | "approved" | "implemented" | "obsolete" | "rejected";
  description: string | null;
  priority: "p1" | "p2" | "p3" | null;
  owner: string | null;
  rationale: string | null;
  source: string | null;
  rejectionReason: string | null;
  reviewer: string | null;
  obsoletedBy: string | null;
  rejectedAt: string | null;
  deletedAt: string | null;
  approvedAt: string | null;
  implementedAt: string | null;
  obsolescenceReason: string | null;
  obsoleteAt: string | null;
  implementationTickets: readonly unknown[];
  createdAt: string;
  updatedAt: string;
}>;

export type UserAdministration = Readonly<{
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: "pending" | "active" | "deactivated";
  globalRoles: readonly string[];
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type Session = Readonly<{
  id: string;
  createdAt: string;
  lastActivityAt: string;
  revokedAt: string | null;
}>;

export type ProjectMembership = Readonly<{
  userId: string;
  username: string;
  displayName: string;
  roles: readonly ProjectRole[];
}>;

function apiUrl(path: string): string {
  return new URL(path, API_BASE_URL).toString();
}

function authenticatedHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers);
  result.set("Accept", "application/json");
  result.set("Authorization", `Bearer ${E2E_ACCESS_TOKEN}`);
  return result;
}

function jsonHeaders(headers?: HeadersInit): Headers {
  const result = authenticatedHeaders(headers);
  result.set("Content-Type", "application/json");
  return result;
}

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (text.trim().length === 0) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  expectedStatus: number | readonly number[] = 200,
): Promise<T> {
  const statuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: init.headers ?? authenticatedHeaders(),
  });
  const body = await readResponseBody(response);

  expect(
    statuses,
    `Expected ${init.method ?? "GET"} ${path} to return ${statuses.join(" or ")}, got ${response.status} with ${JSON.stringify(body)}.`,
  ).toContain(response.status);

  return body as T;
}

async function requestEmpty(
  path: string,
  init: RequestInit = {},
  expectedStatus: number | readonly number[] = 204,
): Promise<void> {
  await requestJson<unknown>(path, init, expectedStatus);
}

export async function publicRequestJson<T>(
  path: string,
  init: RequestInit = {},
  expectedStatus: number | readonly number[] = 200,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  const response = await fetch(apiUrl(path), { ...init, headers });
  const body = await readResponseBody(response);
  const statuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];

  expect(
    statuses,
    `Expected ${init.method ?? "GET"} ${path} to return ${statuses.join(" or ")}, got ${response.status} with ${JSON.stringify(body)}.`,
  ).toContain(response.status);

  return body as T;
}

export async function publicRequestEmpty(
  path: string,
  init: RequestInit = {},
  expectedStatus: number | readonly number[] = 204,
): Promise<void> {
  await publicRequestJson<unknown>(path, init, expectedStatus);
}

export function jsonRequest(method: "POST" | "PATCH" | "PUT", data: unknown): RequestInit {
  return { method, headers: jsonHeaders(), body: JSON.stringify(data) };
}

export function publicJsonRequest(method: "POST" | "PATCH" | "PUT", data: unknown): RequestInit {
  return {
    method,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

export async function requireBackendAvailable(): Promise<void> {
  await publicRequestJson<unknown>("/auth/bootstrap/status", {}, 200);
  await requestJson<unknown>("/auth/me", {}, 200);
}

export async function requireRealBackendAvailable(): Promise<void> {
  await requireBackendAvailable();
}

export async function signInToRealBackend(
  page: Page,
  username = E2E_LOGIN_USERNAME,
  password = E2E_LOGIN_PASSWORD,
): Promise<void> {
  const currentUser = page.getByLabel("Current user");
  if (await currentUser.isVisible().catch(() => false)) {
    return;
  }

  const bootstrapForm = page.getByRole("heading", {
    name: "Create initial Administrator",
  });
  if (await bootstrapForm.isVisible().catch(() => false)) {
    throw new Error(
      "The real backend reports that initial Administrator bootstrap is still available. Run `pnpm seed:demo` from the backend after applying the seed fix so authentication bootstrap is marked complete.",
    );
  }

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible({
    timeout: 10_000,
  });
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toHaveCount(0, {
    timeout: 10_000,
  });
}

export async function openAuthenticatedRoute(page: Page, route = "/"): Promise<void> {
  await requireRealBackendAvailable();
  await page.goto(route);
  await signInToRealBackend(page);
  await expect(page.getByLabel("Current user")).toBeVisible({ timeout: 10_000 });
}

export async function signInToTestApplication(page: Page): Promise<void> {
  await openAuthenticatedRoute(page, "/");
}

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

export async function updateTestProject(projectId: string, name: string): Promise<Project> {
  return requestJson<Project>(
    `/projects/${encodeURIComponent(projectId)}`,
    jsonRequest("PATCH", { name }),
    200,
  );
}

export async function deleteTestProject(projectId: string): Promise<void> {
  await requestEmpty(`/projects/${encodeURIComponent(projectId)}`, { method: "DELETE", headers: authenticatedHeaders() }, [204, 404]);
}

export async function createTestCategory(
  projectId: string,
  categoryData: Readonly<{ key: string; type: string; name: string }>,
): Promise<Category> {
  return requestJson<Category>(
    `/projects/${encodeURIComponent(projectId)}/categories`,
    jsonRequest("POST", {
      key: categoryData.key,
      type: categoryData.type,
      name: categoryData.name,
    }),
    201,
  );
}

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
    jsonRequest("POST", requirementData),
    201,
  );
}

export async function listUsers(): Promise<UserAdministration[]> {
  return requestJson<UserAdministration[]>("/admin/users", {}, 200);
}

export async function getUserByDisplayName(displayName: string): Promise<UserAdministration> {
  const users = await listUsers();
  const user = users.find((candidate) => candidate.displayName === displayName);
  if (user === undefined) throw new Error(`User "${displayName}" was not found.`);
  return user;
}

export async function getUserById(userId: string): Promise<UserAdministration> {
  const users = await listUsers();
  const user = users.find((candidate) => candidate.id === userId);
  if (user === undefined) throw new Error(`User with id "${userId}" was not found.`);
  return user;
}

export async function setUserStatus(
  userId: string,
  status: "active" | "deactivated",
): Promise<UserAdministration> {
  return requestJson<UserAdministration>(
    `/admin/users/${encodeURIComponent(userId)}/status`,
    jsonRequest("PATCH", { status }),
    200,
  );
}

export async function listUserSessions(userId: string): Promise<Session[]> {
  return requestJson<Session[]>(`/admin/users/${encodeURIComponent(userId)}/sessions`, {}, 200);
}

export async function revokeUserSession(userId: string, sessionId: string): Promise<void> {
  await requestEmpty(
    `/admin/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/revoke`,
    { method: "POST", headers: authenticatedHeaders() },
    204,
  );
}

export async function registerUniqueUser(prefix: string, displayName: string): Promise<UserAdministration> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const username = `${prefix}-${suffix}`.replace(/[^A-Za-z0-9._-]/gu, "-").slice(0, 64);
  const email = `${username}@example.invalid`;
  await publicRequestJson<unknown>(
    "/auth/register",
    publicJsonRequest("POST", {
      username,
      email,
      displayName,
      password: "correct horse battery staple",
    }),
    202,
  );
  const users = await listUsers();
  const user = users.find((candidate) => candidate.username === username);
  if (user === undefined) throw new Error(`Registered user "${username}" was not visible to administration.`);
  return user;
}

export async function listProjectMemberships(projectId: string): Promise<ProjectMembership[]> {
  return requestJson<ProjectMembership[]>(
    `/admin/projects/${encodeURIComponent(projectId)}/memberships`,
    {},
    200,
  );
}

export async function setProjectMembership(
  projectId: string,
  userId: string,
  roles: readonly ProjectRole[],
): Promise<ProjectMembership> {
  return requestJson<ProjectMembership>(
    `/admin/projects/${encodeURIComponent(projectId)}/memberships/${encodeURIComponent(userId)}`,
    jsonRequest("PUT", { roles }),
    200,
  );
}

export async function removeProjectMembership(projectId: string, userId: string): Promise<void> {
  await requestEmpty(
    `/admin/projects/${encodeURIComponent(projectId)}/memberships/${encodeURIComponent(userId)}`,
    { method: "DELETE", headers: authenticatedHeaders() },
    [204, 404],
  );
}

export async function updateRequirementStatus(
  projectId: string,
  requirementId: string,
  data: Record<string, unknown>,
): Promise<Requirement> {
  return requestJson<Requirement>(
    `/projects/${encodeURIComponent(projectId)}/requirements/${encodeURIComponent(requirementId)}`,
    jsonRequest("PATCH", data),
    200,
  );
}

export type ImplementationTicket = Readonly<{
  id: string;
  requirementId: string;
  ticketId: string;
  completedBy: string;
  completedAt: string;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export async function createImplementationTicket(
  projectId: string,
  requirementId: string,
  ticketId: string,
): Promise<ImplementationTicket> {
  return requestJson<ImplementationTicket>(
    `/projects/${encodeURIComponent(projectId)}/requirements/${encodeURIComponent(requirementId)}/implementation-tickets`,
    jsonRequest("POST", {
      ticketId,
      completedAt: "2026-09-02",
      completedBy: "E2E Requirements Engineer",
    }),
    201,
  );
}
