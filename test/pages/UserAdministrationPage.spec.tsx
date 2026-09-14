import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UserAdministrationPage } from "@/pages/Administration/UserAdministrationPage";

const mocks = vi.hoisted(() => ({ useUserAdministration: vi.fn() }));

vi.mock("@/pages/Administration/useUserAdministration", () => ({
  useUserAdministration: mocks.useUserAdministration,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("UserAdministrationPage", () => {
  it("renders inside the dedicated workspace without the legacy in-page administration navigation", () => {
    mocks.useUserAdministration.mockReturnValue({
      users: [],
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
    });

    render(<UserAdministrationPage />);

    expect(
      screen.getByRole("heading", { name: "Users & Sessions" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Administration sections" }),
    ).not.toBeInTheDocument();
  });
});
