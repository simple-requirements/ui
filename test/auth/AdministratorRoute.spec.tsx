import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { AdministratorRoute } from "@/auth/AdministratorRoute";
import type { AccountRole, AuthenticatedUser } from "@/auth/authTypes";
import {
  clearAuthenticatedSession,
  setAuthenticatedSession,
} from "@/stores/authStore";

/**
 * Builds an authenticated user for Administrator route tests.
 * @param role Account role assigned to the user.
 * @returns Authenticated user fixture.
 */
function user(role: AccountRole): AuthenticatedUser {
  return {
    id: "user-1",
    username: "alice",
    email: "alice@example.org",
    displayName: "Alice",
    status: "active",
    role,
    projectMemberships: [],
  };
}

/**
 * Renders the Administrator route test harness at the users page.
 * @returns Nothing.
 */
function renderRoute(): void {
  const router = createMemoryRouter(
    [
      { path: "/", element: <h1>Workspace</h1> },
      {
        element: <AdministratorRoute />,
        children: [
          { path: "/admin/users", element: <h1>Users &amp; Sessions</h1> },
          { path: "/admin/projects", element: <h1>Projects</h1> },
        ],
      },
    ],
    { initialEntries: ["/admin/users"] },
  );
  render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
  clearAuthenticatedSession();
});

describe("AdministratorRoute", () => {
  it("renders the dedicated Administrator workspace for an Administrator", async () => {
    setAuthenticatedSession({
      accessToken: "token",
      user: user("administrator"),
    });
    renderRoute();

    expect(
      await screen.findByRole("heading", { name: "Users & Sessions" }),
    ).toBeInTheDocument();
  });

  it("redirects a project-scoped account to the project workspace", async () => {
    setAuthenticatedSession({ accessToken: "token", user: user("viewer") });
    renderRoute();

    expect(
      await screen.findByRole("heading", { name: "Workspace" }),
    ).toBeInTheDocument();
  });
});
