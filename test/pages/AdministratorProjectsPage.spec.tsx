import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdministratorProjectsPage } from "@/pages/Administration/AdministratorProjectsPage";

const mocks = vi.hoisted(() => ({
  useAdministratorProjects: vi.fn(),
}));

vi.mock("@/pages/Administration/useAdministratorProjects", () => ({
  useAdministratorProjects: mocks.useAdministratorProjects,
}));

const project = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Project Alpha",
  categoryNames: ["Authentication"],
  categoryCount: 1,
  requirementCount: 3,
  memberships: [
    {
      userId: "22222222-2222-4222-8222-222222222222",
      username: "viewer",
      displayName: "Viewer",
      role: "viewer" as const,
    },
  ],
  ticketUrlTemplate: null,
};

function administrationState() {
  return {
    projects: [project],
    projectsLoading: false,
    projectsError: false,
    users: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        username: "developer",
        email: "developer@example.org",
        displayName: "Developer",
        status: "active" as const,
        role: "developer" as const,
        emailVerifiedAt: "2026-09-01T10:00:00.000Z",
        createdAt: "2026-09-01T09:00:00.000Z",
        updatedAt: "2026-09-01T10:00:00.000Z",
      },
    ],
    usersLoading: false,
    usersError: false,
    createProject: vi.fn().mockResolvedValue(project),
    updateProject: vi.fn().mockResolvedValue(project),
    deleteProject: vi.fn().mockResolvedValue(undefined),
    addMembership: vi.fn().mockResolvedValue(undefined),
    removeMembership: vi.fn().mockResolvedValue(undefined),
    mutationPending: false,
    mutationError: false,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdministratorProjectsPage", () => {
  it("shows only administrative project summary data and settings", async () => {
    mocks.useAdministratorProjects.mockReturnValue(administrationState());
    const interaction = userEvent.setup();

    render(<AdministratorProjectsPage />);

    await interaction.click(
      screen.getByRole("button", { name: /Project Alpha/u }),
    );

    expect(
      screen.getByRole("heading", { name: "Project Alpha" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Authentication")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByLabelText("Ticket URL template")).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Memberships for Project Alpha" }),
    ).toBeInTheDocument();
  });

  it("adds membership using the account's fixed role", async () => {
    const state = administrationState();
    mocks.useAdministratorProjects.mockReturnValue(state);
    const interaction = userEvent.setup();

    render(<AdministratorProjectsPage />);
    await interaction.click(
      screen.getByRole("button", { name: /Project Alpha/u }),
    );
    await interaction.selectOptions(
      screen.getByLabelText("User"),
      "33333333-3333-4333-8333-333333333333",
    );
    await interaction.click(
      screen.getByRole("button", { name: "Add membership" }),
    );

    expect(state.addMembership).toHaveBeenCalledWith({
      projectId: project.id,
      userId: "33333333-3333-4333-8333-333333333333",
    });
  });

  it("opens the shared project dialog for project creation", async () => {
    mocks.useAdministratorProjects.mockReturnValue(administrationState());
    const interaction = userEvent.setup();

    render(<AdministratorProjectsPage />);
    await interaction.click(
      screen.getByRole("button", { name: "New project" }),
    );

    expect(
      screen.getByRole("heading", { name: "Create project" }),
    ).toBeInTheDocument();
  });
});
