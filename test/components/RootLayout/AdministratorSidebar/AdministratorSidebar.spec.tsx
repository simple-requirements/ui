import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { AdministratorSidebar } from "@/components/RootLayout/AdministratorSidebar/AdministratorSidebar";

afterEach(cleanup);

describe("AdministratorSidebar", () => {
  it("contains exactly the initial Users & Sessions and Projects workspace links", () => {
    render(
      <MemoryRouter initialEntries={["/admin/users"]}>
        <AdministratorSidebar />
      </MemoryRouter>,
    );

    const navigation = screen.getByRole("navigation", {
      name: "Administrator sections",
    });
    const links = screen.getAllByRole("link");

    expect(
      screen.getByRole("complementary", { name: "Administrator workspace" }),
    ).toBeInTheDocument();
    expect(navigation).toBeInTheDocument();
    expect(links).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Users & Sessions" }),
    ).toHaveAttribute("href", "/admin/users");
    expect(screen.getByRole("link", { name: "Users & Sessions" })).toHaveClass(
      "administrator-sidebar__link--active",
    );
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/admin/projects",
    );
  });
});
