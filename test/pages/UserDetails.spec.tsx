import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { UserAdministrationResponse } from "@/api/authApi";
import { UserDetails } from "@/pages/Administration/UserDetails";

const verifiedUser: UserAdministrationResponse = {
  id: "user-1",
  username: "alice",
  email: "alice@example.org",
  displayName: "Alice",
  status: "active",
  role: "viewer",
  emailVerifiedAt: "2099-09-01T10:00:00.000Z",
  createdAt: "2026-09-01T09:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
};

afterEach(cleanup);

describe("UserDetails", () => {
  it("shows account metadata without the redundant username or local account-state control", () => {
    render(
      <UserDetails
        user={verifiedUser}
        loggedIn={false}
        pending={false}
        onOpenRoleDialog={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Alice" })).toBeInTheDocument();
    expect(screen.queryByText("@alice")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /account$/iu }),
    ).not.toBeInTheDocument();
  });

  it("opens role administration from the role metadata link", async () => {
    const interaction = userEvent.setup();
    const onOpenRoleDialog = vi.fn();
    render(
      <UserDetails
        user={verifiedUser}
        loggedIn={false}
        pending={false}
        onOpenRoleDialog={onOpenRoleDialog}
      />,
    );

    await interaction.click(screen.getByRole("button", { name: "Viewer" }));

    expect(onOpenRoleDialog).toHaveBeenCalledWith(verifiedUser, false);
  });
});
