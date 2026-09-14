import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UserAdministrationPage } from "@/pages/Administration/UserAdministrationPage";

const mocks = vi.hoisted(() => ({
  useUserAdministration: vi.fn(),
  useUserPresence: vi.fn(),
}));

vi.mock("@/pages/Administration/useUserAdministration", () => ({
  useUserAdministration: mocks.useUserAdministration,
}));
vi.mock("@/pages/Administration/useUserPresence", () => ({
  useUserPresence: mocks.useUserPresence,
}));

const user = {
  id: "11111111-1111-4111-8111-111111111111",
  username: "developer",
  email: "developer@example.org",
  displayName: "Developer",
  status: "active" as const,
  role: "developer" as const,
  emailVerifiedAt: "2026-09-01T10:00:00.000Z",
  createdAt: "2026-09-01T09:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
};

function state() {
  return {
    users: [user],
    usersLoading: false,
    usersError: false,
    sessions: [],
    sessionsLoading: false,
    sessionsError: false,
    mutationPending: false,
    changeRole: vi.fn(),
    changeStatus: vi.fn(),
    revokeSession: vi.fn(),
    revokeAllSessions: vi.fn(),
  };
}

function renderPage(initialEntry = "/admin/users") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/admin/users/:userId?"
          element={<UserAdministrationPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("UserAdministrationPage", () => {
  it("renders the expanded full-width user table with login presence and actions", () => {
    mocks.useUserAdministration.mockReturnValue(state());
    mocks.useUserPresence.mockReturnValue(
      new Map([
        [
          user.id,
          { active: true, activeSessionCount: 1, loading: false, error: false },
        ],
      ]),
    );

    renderPage();

    expect(
      screen.getByRole("columnheader", { name: "Role" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Created at" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Email verified at" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Is active" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Logged in")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Deactivate Developer" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Log out Developer" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete Developer" }),
    ).toBeDisabled();
  });

  it("opens account-role administration from the role link", async () => {
    mocks.useUserAdministration.mockReturnValue(state());
    mocks.useUserPresence.mockReturnValue(new Map());
    const interaction = userEvent.setup();

    renderPage();
    await interaction.click(screen.getByRole("button", { name: "Developer" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/Deactivate this account before changing its role/u),
    ).toBeInTheDocument();
  });

  it("shows user and current session information for a user selected in the sidebar", () => {
    mocks.useUserAdministration.mockReturnValue(state());
    mocks.useUserPresence.mockReturnValue(new Map());

    renderPage(`/admin/users/${user.id}`);

    expect(
      screen.getByRole("heading", { name: "Developer" }),
    ).toBeInTheDocument();
    expect(screen.getByText("developer@example.org")).toBeInTheDocument();
    expect(
      screen.getByText("This user is not currently logged in."),
    ).toBeInTheDocument();
  });
});
