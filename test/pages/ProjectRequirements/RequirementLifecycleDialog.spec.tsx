import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RequirementLifecycleDialog } from "@/pages/ProjectRequirements/RequirementLifecycleDialog";

afterEach(cleanup);

describe("RequirementLifecycleDialog", () => {
  it("requires a name and reason when configured for rejection or obsolescence.", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <RequirementLifecycleDialog
        visible
        title="Mark requirement obsolete"
        nameLabel="Name"
        reasonRequired
        onAbort={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    const okButton = screen.getByRole("button", { name: "OK" });
    expect(okButton).toBeDisabled();
    await user.type(
      screen.getByRole("textbox", { name: "Name" }),
      "Olivia Owner",
    );
    expect(okButton).toBeDisabled();
    await user.type(
      screen.getByRole("textbox", { name: "Reason" }),
      "Superseded.",
    );
    await user.click(okButton);

    expect(onConfirm).toHaveBeenCalledWith("Olivia Owner", "Superseded.");
  });

  it("supports a name-only approval.", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <RequirementLifecycleDialog
        visible
        title="Approve requirement"
        onAbort={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Reviewer" }),
      "Rita Reviewer",
    );
    await user.click(screen.getByRole("button", { name: "OK" }));

    expect(onConfirm).toHaveBeenCalledWith("Rita Reviewer", undefined);
  });
});
