import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AccountRole } from "@/auth/authTypes";
import { RootLayout } from "@/pages/RootLayout";
import {
  clearAuthenticatedSession,
  setAuthenticatedSession,
} from "@/stores/authStore";

vi.mock("@/components/Feedback/AppToast/AppToast", () => ({
  AppToast: () => null,
}));
vi.mock("@/components/RootLayout/ActionBar/ActionBar", () => ({
  ActionBar: () => <div>Action bar</div>,
}));
vi.mock("@/components/RootLayout/LoadingOverlay", () => ({
  LoadingOverlay: () => null,
}));
vi.mock("@/components/RootLayout/TabBar/TabBar", () => ({
  TabBar: () => <div>Tab bar</div>,
}));
vi.mock("@/components/RootLayout/Sidebar/Sidebar", () => ({
  Sidebar: () => <nav aria-label="Project sidebar">Project sidebar</nav>,
}));
vi.mock(
  "@/components/RootLayout/AdministratorSidebar/AdministratorSidebar",
  () => ({
    AdministratorSidebar: () => (
      <nav aria-label="Administrator sidebar">Administrator sidebar</nav>
    ),
  }),
);

/**
 * Renders the authenticated root layout for one account role.
 * @param role Account role selected for the session fixture.
 * @returns Nothing.
 */
function renderLayout(role: AccountRole): void {
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
      {
        path: "/",
        element: <RootLayout />,
        children: [{ index: true, element: <h1>Content</h1> }],
      },
    ],
    { initialEntries: ["/"] },
  );

  render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
  clearAuthenticatedSession();
});

describe("RootLayout", () => {
  it("uses the dedicated Administrator sidebar for Administrator accounts", () => {
    renderLayout("administrator");

    expect(
      screen.getByRole("navigation", { name: "Administrator sidebar" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Project sidebar" }),
    ).not.toBeInTheDocument();
  });

  it("uses project navigation for project-scoped accounts", () => {
    renderLayout("viewer");

    expect(
      screen.getByRole("navigation", { name: "Project sidebar" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Administrator sidebar" }),
    ).not.toBeInTheDocument();
  });
});
