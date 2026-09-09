import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RegistrationPage } from "@/pages/RegistrationPage/RegistrationPage";

const mocks = vi.hoisted(() => ({ registerUser: vi.fn() }));

vi.mock("@/api/authApi", () => ({ registerUser: mocks.registerUser }));

function renderPage(): void {
  render(
    <MemoryRouter>
      <RegistrationPage />
    </MemoryRouter>,
  );
}

async function completeForm(): Promise<void> {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Username"), "  alice  ");
  await user.type(
    screen.getByLabelText("Email address"),
    "  ALICE@Example.org  ",
  );
  await user.type(screen.getByLabelText("Display name"), "  Alice Example  ");
  await user.type(
    screen.getByLabelText("Password", { exact: true }),
    "correct horse battery staple",
  );
  await user.type(
    screen.getByLabelText("Confirm password"),
    "correct horse battery staple",
  );
}

beforeEach(() => {
  mocks.registerUser.mockResolvedValue({
    data: { message: "Registration received." },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("RegistrationPage", () => {
  it("submits normalized local-account data and explains the activation steps", async () => {
    const user = userEvent.setup();
    renderPage();
    await completeForm();

    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(mocks.registerUser).toHaveBeenCalledWith({
      username: "alice",
      email: "alice@example.org",
      displayName: "Alice Example",
      password: "correct horse battery staple",
    });
    expect(
      await screen.findByRole("heading", { name: "Registration received" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("verify the address");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Administrator must activate",
    );
  });

  it("does not expose backend account details when registration fails", async () => {
    mocks.registerUser.mockRejectedValue(new Error("Username already exists"));
    const user = userEvent.setup();
    renderPage();
    await completeForm();

    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Registration could not be submitted",
    );
    expect(screen.queryByText(/already exists/iu)).not.toBeInTheDocument();
  });
});
