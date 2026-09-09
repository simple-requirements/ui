import { afterEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/api/fetch";
import type { ApiError } from "@/api/fetch";
import type { AuthenticatedUser } from "@/auth/authTypes";
import {
  authStore,
  clearAuthenticatedSession,
  setAuthenticatedSession,
} from "@/stores/authStore";

const authenticatedUser: AuthenticatedUser = {
  id: "user-1",
  username: "alice",
  email: "alice@example.org",
  displayName: "Alice",
  status: "active",
  globalRoles: [],
};

function createJsonResponse(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);

  headers.set("Content-Type", "application/json");

  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers,
  });
}

afterEach(() => {
  clearAuthenticatedSession();
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("reads JSON responses and adds the default Accept header.", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiFetch("/projects")).resolves.toMatchObject({
      data: { ok: true },
      status: 200,
    });

    const requestUrl = fetchMock.mock.calls[0]?.[0] as URL;
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(requestUrl.toString()).toBe("http://localhost:3000/projects");
    expect(new Headers(requestInit.headers).get("Accept")).toBe(
      "application/json",
    );
    expect(new Headers(requestInit.headers).has("Authorization")).toBe(false);
  });

  it("adds the in-memory bearer token to authenticated requests.", async () => {
    setAuthenticatedSession({
      accessToken: "opaque-token",
      user: authenticatedUser,
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/projects");

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(new Headers(requestInit.headers).get("Authorization")).toBe(
      "Bearer opaque-token",
    );
  });

  it("keeps a caller-provided Accept header.", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/projects", { headers: { Accept: "text/plain" } });

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(new Headers(requestInit.headers).get("Accept")).toBe("text/plain");
  });

  it("returns undefined data for 204 responses.", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );

    await expect(apiFetch("/projects/project-alpha")).resolves.toMatchObject({
      data: undefined,
      status: 204,
    });
  });

  it("throws ApiError for non-OK responses.", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          createJsonResponse({ message: "Bad request" }, { status: 400 }),
        ),
    );

    await expect(apiFetch("/projects")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      body: { message: "Bad request" },
    } satisfies Partial<ApiError>);
  });

  it("clears authentication and throws a typed error for 401 responses.", async () => {
    setAuthenticatedSession({
      accessToken: "expired-token",
      user: authenticatedUser,
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          createJsonResponse({ message: "Unauthorized" }, { status: 401 }),
        ),
    );

    await expect(apiFetch("/projects")).rejects.toMatchObject({
      name: "AuthenticationRequiredError",
      status: 401,
    });
    expect(authStore.state.status).toBe("unauthenticated");
  });

  it("keeps authentication and throws a typed error for 403 responses.", async () => {
    setAuthenticatedSession({
      accessToken: "valid-token",
      user: authenticatedUser,
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          createJsonResponse({ message: "Forbidden" }, { status: 403 }),
        ),
    );

    await expect(apiFetch("/projects")).rejects.toMatchObject({
      name: "AccessDeniedError",
      status: 403,
    });
    expect(authStore.state.status).toBe("authenticated");
  });
});
