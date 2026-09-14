import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import type { AccountRole } from "@/auth/authTypes";
import { WorkspacePage } from "@/pages/WorkspacePage";
import {
  clearAuthenticatedSession,
  setAuthenticatedSession,
} from "@/stores/authStore";

/**
 * Renders the workspace entry for one authenticated account role.
 * @param role Account role used by the route fixture.
 * @returns Nothing.
 */
function renderWorkspace(role: AccountRole): void {
  setAuthenticatedSession({
    accessToken: "token",
    user: {
      id: "user-1",
      username: role,
      email: `${role}@example.org`,
      displayName: role,
      status: "active",
      role,
      projectMemberships: [],
    },
  });
  const router = createMemoryRouter(
    [
      { path: "/", element: <WorkspacePage /> },
      { path: "/admin/users", element: <h1>Users &amp; Sessions</h1> },
    ],
    { initialEntries: ["/"] },
  );

  render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
  clearAuthenticatedSession();
});

describe("WorkspacePage", () => {
  it("redirects Administrators directly to the dedicated Administrator workspace", async () => {
    renderWorkspace("administrator");

    expect(
      await screen.findByRole("heading", { name: "Users & Sessions" }),
    ).toBeInTheDocument();
  });

  it("keeps project-scoped accounts in the project workspace", () => {
    renderWorkspace("viewer");

    expect(
      screen.getByRole("heading", { name: "Workspace" }),
    ).toBeInTheDocument();
  });
});
