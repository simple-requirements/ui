import "@testing-library/jest-dom/vitest";

import * as ReactQuery from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Sidebar } from "@/components/RootLayout/Sidebar/Sidebar";
import {
  clearAuthenticatedSession,
  setAuthenticatedSession,
} from "@/stores/authStore";

type TestProject = Readonly<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  requirementCount: number;
}>;

type UseLiveQueryResult = Readonly<{ data: readonly TestProject[] }>;

const mocks = vi.hoisted(() => ({
  useLiveQuery: vi.fn(),
  useQueries: vi.fn(),
  contextMenuShow: vi.fn(),
}));

vi.mock("@tanstack/react-db", () => ({ useLiveQuery: mocks.useLiveQuery }));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactQuery>();

  return { ...actual, useQueries: mocks.useQueries };
});

vi.mock("@/api/collections/projectsCollection", () => ({
  projectsCollection: {},
}));

vi.mock("@/components/RootLayout/Sidebar/SidebarContextMenu", () => ({
  SidebarContextMenu: ({
    contextMenuRef,
    onExportProject,
    onExportAllProjects,
  }: {
    contextMenuRef: unknown;
    onExportProject?: () => void;
    onExportAllProjects?: () => void;
  }) => {
    (
      contextMenuRef as { current: { show: (event: unknown) => void } | null }
    ).current = {
      show: mocks.contextMenuShow,
    };

    return (
      <nav aria-label="Sidebar context menu">
        <button type="button" onClick={onExportProject}>
          Export project
        </button>
        <button type="button" onClick={onExportAllProjects}>
          Export all projects
        </button>
      </nav>
    );
  },
}));

function createTestQueryClient(): ReactQuery.QueryClient {
  return new ReactQuery.QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderSidebar(initialEntry = "/"): ReturnType<typeof render> {
  if (mocks.useQueries.getMockImplementation() === undefined) {
    mockRequirementCountQueries();
  }

  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: (
          <ReactQuery.QueryClientProvider client={createTestQueryClient()}>
            <Sidebar />
          </ReactQuery.QueryClientProvider>
        ),
        handle: { actionBar: "requirements" },
      },
      {
        path: "/projects/:projectId/categories/new",
        element: (
          <ReactQuery.QueryClientProvider client={createTestQueryClient()}>
            <Sidebar />
          </ReactQuery.QueryClientProvider>
        ),
        handle: { actionBar: "categoryForm", disableChromeActions: true },
      },
      {
        path: "/projects/:projectId/*",
        element: (
          <ReactQuery.QueryClientProvider client={createTestQueryClient()}>
            <Sidebar />
          </ReactQuery.QueryClientProvider>
        ),
        handle: { actionBar: "requirements" },
      },
    ],
    { initialEntries: [initialEntry] },
  );

  return render(<RouterProvider router={router} />);
}

function createProject(overrides: Partial<TestProject>): TestProject {
  return {
    id: "project-id",
    name: "Project",
    createdAt: "2026-06-28T10:00:00.000Z",
    updatedAt: "2026-06-28T10:00:00.000Z",
    requirementCount: 0,
    ...overrides,
  };
}

function mockUseLiveQuery(result: Partial<UseLiveQueryResult>): void {
  mocks.useLiveQuery.mockReturnValue({ data: [], ...result });
}

function mockRequirementCountQueries(
  countsByProjectId: Readonly<Record<string, number>> = {},
): void {
  mocks.useQueries.mockImplementation(
    ({ queries }: { queries: readonly { queryKey: readonly unknown[] }[] }) =>
      queries.map((query) => {
        const queryKey = String(query.queryKey[0]);
        const projectId = queryKey
          .replace("/projects/", "")
          .replace("/requirements", "");
        const count = countsByProjectId[projectId] ?? 0;

        return {
          data: Array.from({ length: count }, (_, index) => ({
            id: `${projectId}-requirement-${String(index)}`,
          })),
        };
      }),
  );
}

beforeEach(() => {
  setAuthenticatedSession({
    accessToken: "test-token",
    user: {
      id: "11111111-1111-4111-8111-111111111111",
      username: "engineer",
      email: "engineer@example.org",
      displayName: "Requirements Engineer",
      status: "active",
      role: "requirements_engineer",
      projectMemberships: [{ projectId: "project-alpha" }],
    },
  });
});

afterEach(() => {
  cleanup();
  mocks.useLiveQuery.mockReset();
  mocks.useQueries.mockReset();
  mocks.contextMenuShow.mockReset();
  clearAuthenticatedSession();
});

describe("Sidebar", () => {
  it("renders the main sidebar regions.", () => {
    mockUseLiveQuery({ data: [] });

    renderSidebar();

    expect(
      screen.getByRole("complementary", { name: /projects/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /project actions/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /project list/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /sidebar context menu/i }),
    ).toBeInTheDocument();
  });

  it("sorts projects by name before rendering the navigation list.", () => {
    mockUseLiveQuery({
      data: [
        createProject({
          id: "project-zeta",
          name: "Zeta Project",
          requirementCount: 0,
        }),
        createProject({
          id: "project-alpha",
          name: "Alpha Project",
          requirementCount: 0,
        }),
        createProject({
          id: "project-beta",
          name: "Beta Project",
          requirementCount: 0,
        }),
      ],
    });
    mockRequirementCountQueries({
      "project-alpha": 4,
      "project-beta": 7,
      "project-zeta": 2,
    });

    renderSidebar();

    const navigation = screen.getByRole("navigation", {
      name: /project list/i,
    });
    const projectButtons = within(navigation).getAllByRole("button");

    expect(projectButtons.map((button) => button.textContent.trim())).toEqual([
      "Alpha Project4",
      "Beta Project7",
      "Zeta Project2",
    ]);
  });

  it("uses the loaded requirements count behind each project name.", () => {
    mockUseLiveQuery({
      data: [
        createProject({
          id: "project-alpha",
          name: "Alpha Project",
          requirementCount: 0,
        }),
      ],
    });
    mockRequirementCountQueries({ "project-alpha": 4 });

    renderSidebar();

    expect(
      screen.getByRole("button", { name: /alpha project/i }),
    ).toHaveTextContent("Alpha Project4");
  });

  it("opens a project and updates the route-driven active sub item.", async () => {
    const user = userEvent.setup();

    mockUseLiveQuery({
      data: [
        createProject({
          id: "project-alpha",
          name: "Alpha Project",
          requirementCount: 4,
        }),
        createProject({
          id: "project-beta",
          name: "Beta Project",
          requirementCount: 7,
        }),
      ],
    });

    renderSidebar();

    const alphaButton = screen.getByRole("button", { name: /alpha project/i });

    await user.click(alphaButton);

    expect(alphaButton).toHaveAttribute("aria-expanded", "true");
    expect(alphaButton).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: /requirements/i }),
    ).not.toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("link", { name: /categories/i }));

    expect(alphaButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /categories/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("disables project action buttons on category form routes.", () => {
    mockUseLiveQuery({ data: [] });

    renderSidebar("/projects/project-alpha/categories/new");

    expect(
      screen.getByRole("button", { name: /synchronize projects/i }),
    ).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /new project/i }),
    ).not.toBeInTheDocument();
  });
});
