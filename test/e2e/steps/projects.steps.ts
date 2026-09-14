import { expect, type Page } from "@playwright/test";
import { createBdd, test } from "playwright-bdd";
import {
  createTestProject,
  deleteTestProject,
  E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME,
  listTestProjects,
  openAuthenticatedRoute,
  resetTestBackend,
} from "./authenticated-test-backend";

const { Given, When, Then } = createBdd(test);

const APPLICATION_LOADING_TIMEOUT_MS = 15_000;

type DataTable = Readonly<{
  hashes: () => readonly Record<string, string>[];
}>;

type BackendProject = Awaited<ReturnType<typeof createTestProject>>;

function getProjectNames(dataTable: DataTable): string[] {
  return dataTable.hashes().map((row) => {
    const projectName = row.name;
    if (projectName.trim().length === 0) {
      throw new Error(
        'The project data table must contain a non-empty "name" column.',
      );
    }
    return projectName;
  });
}

async function clearBackendProjects(): Promise<void> {
  const projects: BackendProject[] = await listTestProjects();
  for (const project of projects) {
    await deleteTestProject(project.id);
  }
}

async function setBackendProjects(
  projectNames: readonly string[],
): Promise<void> {
  await clearBackendProjects();
  for (const projectName of projectNames) {
    await createTestProject(projectName);
  }
}

function getProjectList(page: Page) {
  return page.getByRole("navigation", { name: "Project list" });
}

function getVisibleProjectLabels(page: Page) {
  return getProjectList(page).locator(".expandable-navigation-item__label");
}

function getVisibleProjectDialog(page: Page) {
  return page
    .getByRole("dialog")
    .filter({ has: page.getByLabel("Project name") });
}

function getAdministrativeProjectList(page: Page) {
  return page.getByRole("region", { name: "Administrative project list" });
}

async function waitUntilApplicationHasLoaded(page: Page): Promise<void> {
  await expect(page.getByText("SRM is loading ...")).not.toBeVisible({
    timeout: APPLICATION_LOADING_TIMEOUT_MS,
  });
  await expect(
    page.getByText("A network error has occured. Try again."),
  ).not.toBeVisible();
}

async function fillProjectDialog(
  page: Page,
  projectName: string,
): Promise<void> {
  await getVisibleProjectDialog(page)
    .getByLabel("Project name")
    .fill(projectName);
}

async function submitProjectDialog(page: Page): Promise<void> {
  await getVisibleProjectDialog(page)
    .getByRole("button", { name: /^(Create|Rename)$/u })
    .click();
}

Given("the backend contains no projects", async () => {
  await resetTestBackend();
});

Given(
  "the backend contains a project named {string}",
  async ({ page }, projectName: string) => {
    void page;
    await setBackendProjects([projectName]);
  },
);

Given(
  "the backend contains the projects",
  async ({ page }, dataTable: DataTable) => {
    void page;
    await setBackendProjects(getProjectNames(dataTable));
  },
);

When("I open the application", async ({ page }) => {
  await openAuthenticatedRoute(
    page,
    "/",
    E2E_REQUIREMENTS_ENGINEER_LOGIN_USERNAME,
  );
  await waitUntilApplicationHasLoaded(page);
});

When(
  "I open project {string} from the sidebar",
  async ({ page }, projectName: string) => {
    await getProjectList(page)
      .getByRole("button", { name: new RegExp(projectName, "u") })
      .click();
    await expect(page).toHaveURL(new RegExp(`/projects/[^/]+$`, "u"));
  },
);

When("I open Administrator project administration", async ({ page }) => {
  await openAuthenticatedRoute(page, "/admin/projects");
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
});

When(
  "I create a project named {string}",
  async ({ page }, projectName: string) => {
    await page.getByRole("button", { name: "New project" }).click();
    await fillProjectDialog(page, projectName);
    await submitProjectDialog(page);
    await expect(getVisibleProjectDialog(page)).toBeHidden();
  },
);

When(
  "I select administrative project {string}",
  async ({ page }, projectName: string) => {
    await getAdministrativeProjectList(page)
      .getByRole("button", { name: new RegExp(projectName, "u") })
      .click();
    await expect(
      page.getByRole("heading", { name: projectName }),
    ).toBeVisible();
  },
);

When("I choose {string}", async ({ page }, action: string) => {
  await page.getByRole("button", { name: action, exact: true }).click();
});

When(
  "I rename the project to {string}",
  async ({ page }, projectName: string) => {
    await fillProjectDialog(page, projectName);
    await submitProjectDialog(page);
    await expect(getVisibleProjectDialog(page)).toBeHidden();
  },
);

When("I submit the project dialog with an empty name", async ({ page }) => {
  await fillProjectDialog(page, "   ");
  await submitProjectDialog(page);
});

Then(
  "the sidebar should show the projects in this order",
  async ({ page }, dataTable: DataTable) => {
    await expect(getVisibleProjectLabels(page)).toHaveText(
      getProjectNames(dataTable),
    );
  },
);

Then(
  "project administration should contain the project {string}",
  async ({ page }, projectName: string) => {
    await expect(
      getAdministrativeProjectList(page).getByText(projectName, {
        exact: true,
      }),
    ).toBeVisible();
  },
);

Then(
  "project administration should not contain the project {string}",
  async ({ page }, projectName: string) => {
    await expect(
      getAdministrativeProjectList(page).getByText(projectName, {
        exact: true,
      }),
    ).toHaveCount(0);
  },
);

Then(
  "the project dialog should show {string}",
  async ({ page }, message: string) => {
    await expect(
      getVisibleProjectDialog(page).getByText(message, { exact: true }),
    ).toBeVisible();
  },
);
