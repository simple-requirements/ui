import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ActionButton } from "@/components/RootLayout/Sidebar/ActionButton";

describe("ActionButton", () => {
  it("renders the synchronize action.", () => {
    render(<ActionButton />);

    expect(
      screen.getByRole("button", { name: /synchronize projects/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /new project/i }),
    ).not.toBeInTheDocument();
  });

  it("disables synchronization when requested.", () => {
    render(<ActionButton disabled />);

    expect(
      screen.getByRole("button", { name: /synchronize projects/i }),
    ).toBeDisabled();
  });

  it("calls onSynchronize when the synchronize button is clicked.", async () => {
    const onSynchronize = vi.fn();
    const user = userEvent.setup();
    render(<ActionButton onSynchronize={onSynchronize} />);

    await user.click(
      screen.getByRole("button", { name: /synchronize projects/i }),
    );

    expect(onSynchronize).toHaveBeenCalledTimes(1);
  });

  it("can be clicked without a callback.", async () => {
    const user = userEvent.setup();
    render(<ActionButton />);

    await user.click(
      screen.getByRole("button", { name: /synchronize projects/i }),
    );

    expect(
      screen.getByRole("button", { name: /synchronize projects/i }),
    ).toBeEnabled();
  });
});
