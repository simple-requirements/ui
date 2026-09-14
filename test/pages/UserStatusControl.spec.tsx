import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { UserAdministrationResponse } from "@/api/authApi";
import { UserStatusControl } from "@/pages/Administration/UserStatusControl";

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

afterEach(cleanup);

describe("UserStatusControl", () => {
  it("activates a verified account with an assigned role", async () => {
    const interaction = userEvent.setup();
    const onChangeStatus = vi.fn();

    render(
      <UserStatusControl
        user={verifiedUser}
        pending={false}
        onChangeStatus={onChangeStatus}
      />,
    );

    await interaction.click(
      screen.getByRole("button", { name: "Activate account" }),
    );

    expect(onChangeStatus).toHaveBeenCalledWith("active");
  });

  it("blocks activation until email verification and role assignment are complete", () => {
    render(
      <UserStatusControl
        user={{ ...verifiedUser, role: null, emailVerifiedAt: null }}
        pending={false}
        onChangeStatus={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Activate account" }),
    ).toBeDisabled();
    expect(screen.getByText(/must be verified/iu)).toBeInTheDocument();
    expect(screen.getByText(/role must be assigned/iu)).toBeInTheDocument();
  });

  it("deactivates an active account", async () => {
    const interaction = userEvent.setup();
    const onChangeStatus = vi.fn();

    render(
      <UserStatusControl
        user={{ ...verifiedUser, status: "active" }}
        pending={false}
        onChangeStatus={onChangeStatus}
      />,
    );

    await interaction.click(
      screen.getByRole("button", { name: "Deactivate account" }),
    );

    expect(onChangeStatus).toHaveBeenCalledWith("deactivated");
  });
});
