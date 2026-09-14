import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  SessionResponse,
  UserAdministrationResponse,
} from "@/api/authApi";
import { UserDetails } from "@/pages/Administration/UserDetails";

const verifiedUser: UserAdministrationResponse = {
  id: "user-1",
  username: "alice",
  email: "alice@example.org",
  displayName: "Alice",
  status: "pending",
  role: "viewer",
  emailVerifiedAt: "2026-09-01T10:00:00.000Z",
  createdAt: "2026-09-01T09:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
};
const activeSession: SessionResponse = {
  id: "session-1",
  createdAt: "2026-09-01T10:00:00.000Z",
  lastActivityAt: "2026-09-01T11:00:00.000Z",
  revokedAt: null,
};

afterEach(cleanup);

describe("UserDetails", () => {
  it("activates a verified user with an assigned role and revokes sessions", async () => {
    const interaction = userEvent.setup();
    const onChangeStatus = vi.fn();
    const onRevokeSession = vi.fn();
    const onRevokeAllSessions = vi.fn();
    render(
      <UserDetails
        user={verifiedUser}
        sessions={[activeSession]}
        sessionsLoading={false}
        sessionsError={false}
        pending={false}
        onChangeRole={vi.fn()}
        onChangeStatus={onChangeStatus}
        onRevokeSession={onRevokeSession}
        onRevokeAllSessions={onRevokeAllSessions}
      />,
    );

    await interaction.click(
      screen.getByRole("button", { name: "Activate account" }),
    );
    await interaction.click(screen.getByRole("button", { name: /^Revoke$/u }));
    await interaction.click(
      screen.getByRole("button", { name: "Revoke all active sessions" }),
    );

    expect(onChangeStatus).toHaveBeenCalledWith("active");
    expect(onRevokeSession).toHaveBeenCalledWith("session-1");
    expect(onRevokeAllSessions).toHaveBeenCalledOnce();
  });

  it("blocks activation until the email address is verified", () => {
    render(
      <UserDetails
        user={{ ...verifiedUser, emailVerifiedAt: null }}
        sessions={[]}
        sessionsLoading={false}
        sessionsError={false}
        pending={false}
        onChangeRole={vi.fn()}
        onChangeStatus={vi.fn()}
        onRevokeSession={vi.fn()}
        onRevokeAllSessions={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Activate account" }),
    ).toBeDisabled();
    expect(screen.getByText(/must be verified/iu)).toBeInTheDocument();
  });

  it("requires a role before activation and lets an Administrator assign one", async () => {
    const interaction = userEvent.setup();
    const onChangeRole = vi.fn();
    render(
      <UserDetails
        user={{ ...verifiedUser, role: null }}
        sessions={[]}
        sessionsLoading={false}
        sessionsError={false}
        pending={false}
        onChangeRole={onChangeRole}
        onChangeStatus={vi.fn()}
        onRevokeSession={vi.fn()}
        onRevokeAllSessions={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Activate account" }),
    ).toBeDisabled();
    expect(screen.getByText(/role must be assigned/iu)).toBeInTheDocument();

    await interaction.selectOptions(
      screen.getByLabelText("Account role"),
      "requirements_engineer",
    );

    expect(onChangeRole).toHaveBeenCalledWith("requirements_engineer");
  });
});
