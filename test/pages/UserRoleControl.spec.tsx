import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { UserAdministrationResponse } from "@/api/authApi";
import { UserRoleControl } from "@/pages/Administration/UserRoleControl";

const pendingUser: UserAdministrationResponse = {
  id: "user-1",
  username: "alice",
  email: "alice@example.org",
  displayName: "Alice",
  status: "pending",
  role: null,
  emailVerifiedAt: "2026-09-01T10:00:00.000Z",
  createdAt: "2026-09-01T09:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
};

afterEach(cleanup);

describe("UserRoleControl", () => {
  it("assigns one role to an unassigned pending account", async () => {
    const interaction = userEvent.setup();
    const onChangeRole = vi.fn();
    render(
      <UserRoleControl
        user={pendingUser}
        pending={false}
        onChangeRole={onChangeRole}
      />,
    );

    await interaction.selectOptions(
      screen.getByLabelText("Account role"),
      "developer",
    );

    expect(onChangeRole).toHaveBeenCalledWith("developer");
  });

  it("locks the role of an active account", () => {
    render(
      <UserRoleControl
        user={{ ...pendingUser, status: "active", role: "viewer" }}
        pending={false}
        onChangeRole={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Account role")).toBeDisabled();
  });
});
