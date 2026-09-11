import { expect, type Page } from "@playwright/test";
import { createBdd, test } from "playwright-bdd";
import {
  createTestCategory,
  createTestProject,
  createTestRequirement,
  openAuthenticatedRoute,
  resetTestBackend,
} from "./authenticated-test-backend";

const { Given, When, Then } = createBdd(test);

const APPLICATION_LOADING_TIMEOUT_MS = 15_000;

const OPTIONAL_TABLE_VALUE = "—";

type DataTable = Readonly<{ hashes: () => readonly Record<string, string>[] }>;

type BackendProject = Awaited<ReturnType<typeof createTestProject>>;
type BackendCategory = Awaited<ReturnType<typeof createTestCategory>>;
type BackendRequirement = Awaited<ReturnType<typeof createTestRequirement>>;
type RequirementTestContext = Readonly<{
  project: BackendProject;
  categories: readonly BackendCategory[];
  requirements: readonly BackendRequirement[];
}>;

let requirementTestContext: RequirementTestContext | undefined;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function normalizeOptionalTableValue(value: string | undefined): string | null {
  if (
    value === undefined ||
    value.trim().length === 0 ||
    value === OPTIONAL_TABLE_VALUE
  ) {
    return null;
  }

  return value;
}

function formatStatus(status: BackendRequirement["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function requireRequirementTestContext(): RequirementTestContext {
  if (requirementTestContext === undefined) {
    throw new Error("The requirement test context has not been created yet.");
  }

  return requirementTestContext;
}

function requireRequirementByKey(requirementKey: string): BackendRequirement {
  const { requirements } = requireRequirementTestContext();
  const requirement = requirements.find(
    (currentRequirement) => currentRequirement.visibleKey === requirementKey,
  );

  if (requirement === undefined) {
    throw new Error(
      `Requirement "${requirementKey}" has not been created in the requirement test context.`,
    );
  }

  return requirement;
}

function getRequirementRows(
  dataTable: DataTable,
): readonly Record<string, string>[] {
  return dataTable.hashes().map((row) => {
    const categoryKey = row.categoryKey;
    const categoryType = row.categoryType;
    const categoryName = row.categoryName;
    const description = row.description;

    if (
      categoryKey.trim().length === 0 ||
      categoryType.trim().length === 0 ||
      categoryName.trim().length === 0 ||
      description.trim().length === 0
    ) {
      throw new Error(
        'The requirement data table must contain non-empty "categoryKey", "categoryType", "categoryName", and "description" columns.',
      );
    }

    return row;
  });
}


async function createBackendProject(projectName: string): Promise<BackendProject> {
  return createTestProject(projectName);
}

async function createBackendCategory(
  projectId: string,
  categoryData: Readonly<{ key: string; type: string; name: string }>,
): Promise<BackendCategory> {
  return createTestCategory(projectId, categoryData);
}

async function createBackendRequirement(
  projectId: string,
  requirementData: Readonly<{
    categoryId: string;
    description: string | null;
    priority: string | null;
    owner: string | null;
    rationale: string | null;
    source: string | null;
  }>,
): Promise<BackendRequirement> {
  return createTestRequirement(projectId, requirementData);
}

async function openAuthenticatedApplicationRoute(page: Page, route: string): Promise<void> {
  await openAuthenticatedRoute(page, route);
}

async function waitUntilApplicationHasLoaded(page: Page): Promise<void> {
  await expect(page.getByText("SRM is loading ...")).not.toBeVisible({
    timeout: APPLICATION_LOADING_TIMEOUT_MS,
  });
  await expect(
    page.getByText("A network error has occured. Try again."),
  ).not.toBeVisible();
}

function getRequirementListRoute(): string {
  const { project } = requireRequirementTestContext();

  return `/projects/${project.id}/requirements`;
}

function getProjectDetailsRoute(): string {
  const { project } = requireRequirementTestContext();

  return `/projects/${project.id}`;
}

function getRequirementDetailsRoute(requirementKey: string): string {
  const { project } = requireRequirementTestContext();
  const requirement = requireRequirementByKey(requirementKey);

  return `/projects/${project.id}/requirements/${requirement.id}`;
}

function getRequirementTable(page: Page) {
  return page.locator(".project-requirements-list-page__data-table");
}

function getRequirementTableRow(page: Page, requirementKey: string) {
  return getRequirementTable(page)
    .locator(".p-datatable-tbody > tr")
    .filter({ hasText: requirementKey });
}

function getRequirementSelectionCell(page: Page, requirementKey: string) {
  return getRequirementTableRow(page, requirementKey).locator("td").nth(1);
}

function getRequirementDetailsPanel(page: Page) {
  return page.locator(".requirement-details-panel");
}

function getProjectDetailsPage(page: Page) {
  return page.locator(".project-details-page");
}

function getProjectDetailsSummaryCard(page: Page, label: string) {
  return getProjectDetailsPage(page)
    .locator(".project-details-page__summary-card")
    .filter({ hasText: label });
}

function getProjectDetailsStatusRow(page: Page, status: string) {
  return getProjectDetailsPage(page)
    .locator(".project-details-page__status-row")
    .filter({ hasText: status });
}

function getProjectList(page: Page) {
  return page.getByRole("navigation", { name: "Project list" });
}

function getProjectButton(page: Page, projectName: string) {
  return getProjectList(page)
    .getByRole("button")
    .filter({ hasText: projectName });
}

async function openRequirementList(page: Page): Promise<void> {
  await openAuthenticatedApplicationRoute(page, getRequirementListRoute());
  await waitUntilApplicationHasLoaded(page);
  await expect(getRequirementTable(page)).toBeVisible();
}

async function openRequirementDetailsTab(
  page: Page,
  requirementKey: string,
): Promise<void> {
  await openRequirementList(page);
  await getRequirementTableRow(page, requirementKey).dblclick();
  await expect(page).toHaveURL(
    new RegExp(
      `${escapeRegExp(getRequirementDetailsRoute(requirementKey))}$`,
      "u",
    ),
  );
}

Given(
  "the backend contains a requirement test project named {string} with requirements",
  // eslint-disable-next-line no-empty-pattern -- {} Is correct Playwright syntax
  async ({}, projectName: string, dataTable: DataTable) => {
    await resetTestBackend();

    const project = await createBackendProject(projectName);
    const categoriesByKey = new Map<string, BackendCategory>();
    const requirements: BackendRequirement[] = [];

    for (const requirementRow of getRequirementRows(dataTable)) {
      let category = categoriesByKey.get(requirementRow.categoryKey);

      if (category === undefined) {
        category = await createBackendCategory(project.id, {
          key: requirementRow.categoryKey,
          type: requirementRow.categoryType,
          name: requirementRow.categoryName,
        });
        categoriesByKey.set(category.key, category);
      }

      requirements.push(
        await createBackendRequirement(project.id, {
          categoryId: category.id,
          description: requirementRow.description,
          priority: normalizeOptionalTableValue(requirementRow.priority),
          owner: normalizeOptionalTableValue(requirementRow.owner),
          rationale: normalizeOptionalTableValue(requirementRow.rationale),
          source: normalizeOptionalTableValue(requirementRow.source),
        }),
      );
    }

    requirementTestContext = {
      project,
      categories: [...categoriesByKey.values()],
      requirements,
    };
  },
);

When(
  "I open the requirements list for the requirement test project",
  async ({ page }) => {
    await openRequirementList(page);
  },
);

When(
  "I select requirement {string}",
  async ({ page }, requirementKey: string) => {
    await getRequirementSelectionCell(page, requirementKey).click();
  },
);

When("I open the review for the selected requirement", async ({ page }) => {
  await page.getByRole("button", { name: "Review" }).click();
  await expect(
    page.getByRole("heading", { name: "Review comments" }),
  ).toBeVisible();
});

When(
  "I reject the requirement because {string}",
  async ({ page }, reason: string) => {
    await page.getByRole("button", { name: "Reject" }).click();
    const dialog = page.getByRole("dialog", { name: "Reject requirement" });
    await expect(
      dialog.getByRole("textbox", { name: "Reviewer" }),
    ).toHaveCount(0);
    await dialog.getByRole("textbox", { name: "Reason" }).fill(reason);
    await dialog.getByRole("button", { name: "OK" }).click();
  },
);

When(
  "I approve the requirement",
  async ({ page }) => {
    await page.getByRole("button", { name: "Approve" }).click();
    const dialog = page.getByRole("dialog", { name: "Approve requirement" });
    await expect(
      dialog.getByRole("textbox", { name: "Reviewer" }),
    ).toHaveCount(0);
    await dialog.getByRole("button", { name: "OK" }).click();
  },
);

When(
  "I mark the requirement obsolete because {string}",
  async ({ page }, reason: string) => {
    await page.getByRole("button", { name: "Obsolete" }).click();
    const dialog = page.getByRole("dialog", {
      name: "Mark requirement obsolete",
    });
    await expect(dialog.getByRole("textbox", { name: "Name" })).toHaveCount(0);
    await dialog.getByRole("textbox", { name: "Reason" }).fill(reason);
    await dialog.getByRole("button", { name: "OK" }).click();
  },
);

When(
  "I double-click requirement {string}",
  async ({ page }, requirementKey: string) => {
    await getRequirementSelectionCell(page, requirementKey).dblclick();
  },
);

When(
  "I copy requirement key {string}",
  async ({ page }, requirementKey: string) => {
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
    await getRequirementTable(page)
      .getByRole("button", { name: `Copy requirement key ${requirementKey}` })
      .click();
  },
);

Given(
  "I opened the requirement details tab for requirement {string}",
  async ({ page }, requirementKey: string) => {
    await openRequirementDetailsTab(page, requirementKey);
  },
);

When(
  "I open the requirement details URL directly for requirement {string}",
  async ({ page }, requirementKey: string) => {
    await openAuthenticatedApplicationRoute(page, getRequirementDetailsRoute(requirementKey));
    await waitUntilApplicationHasLoaded(page);
  },
);

Then(
  "the requirements table should show the requirements",
  async ({ page }, dataTable: DataTable) => {
    for (const requirementRow of dataTable.hashes()) {
      const row = getRequirementTableRow(page, requirementRow.key);

      await expect(row).toContainText(requirementRow.status);
      await expect(row).toContainText(requirementRow.description);
      await expect(row).toContainText(requirementRow.priority);
      await expect(row).toContainText(requirementRow.owner);
    }
  },
);

Then(
  "the sidebar should show requirement count {int} for project {string}",
  async ({ page }, requirementCount: number, projectName: string) => {
    await expect(getProjectButton(page, projectName)).toContainText(
      requirementCount.toString(),
    );
  },
);

Then(
  "the requirement test project details should show statistics",
  async ({ page }, dataTable: DataTable) => {
    const { project } = requireRequirementTestContext();
    const expectedStatistics = dataTable.hashes()[0];

    await expect(page).toHaveURL(
      new RegExp(`${escapeRegExp(getProjectDetailsRoute())}$`, "u"),
    );
    await expect(
      getProjectDetailsPage(page).getByRole("heading", { name: project.name }),
    ).toBeVisible();
    await expect(
      getProjectDetailsPage(page).getByRole("link", {
        name: "Open categories",
      }),
    ).toBeVisible();
    await expect(
      getProjectDetailsPage(page).getByRole("link", {
        name: "Open requirements",
      }),
    ).toBeVisible();
    await expect(
      getProjectDetailsSummaryCard(page, "Categories"),
    ).toContainText(expectedStatistics.categories);
    await expect(
      getProjectDetailsSummaryCard(page, "Requirements"),
    ).toContainText(expectedStatistics.requirements);

    for (const status of [
      "draft",
      "approved",
      "implemented",
      "obsolete",
      "rejected",
    ] as const) {
      const expectedCount = expectedStatistics[status];

      await expect(
        getProjectDetailsStatusRow(page, formatStatus(status)).locator("dd"),
      ).toHaveText(expectedCount);
    }
  },
);

Then("the Review action should be visible", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Review" })).toBeVisible();
});

Then("the Obsolete action should be visible", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Obsolete" })).toBeVisible();
});

Then("the Edit action should not be visible", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Edit" })).toHaveCount(0);
});

Then(
  "the requirement details should show rejection because {string}",
  async ({ page }, reason: string) => {
    const detailsPanel = getRequirementDetailsPanel(page);
    await expect(detailsPanel).toContainText("Rejected");
    await expect(detailsPanel).toContainText(reason);
  },
);

Then(
  "the requirement status should be {string}",
  async ({ page }, status: string) => {
    await expect(getRequirementDetailsPanel(page)).toContainText(status);
  },
);

Then(
  "the requirement details should show obsolescence because {string}",
  async ({ page }, reason: string) => {
    const detailsPanel = getRequirementDetailsPanel(page);
    await expect(detailsPanel).toContainText("Obsoleted by");
    await expect(detailsPanel).toContainText("Obsolescence reason");
    await expect(detailsPanel).toContainText(reason);
  },
);

Then(
  "the requirement details panel should show requirement {string}",
  async ({ page }, requirementKey: string) => {
    const requirement = requireRequirementByKey(requirementKey);
    const detailsPanel = getRequirementDetailsPanel(page);

    await expect(detailsPanel).toContainText(requirement.visibleKey);
    await expect(detailsPanel).toContainText(formatStatus(requirement.status));
    await expect(detailsPanel).toContainText(
      requirement.description ?? OPTIONAL_TABLE_VALUE,
    );
    await expect(detailsPanel).toContainText(
      requirement.priority ?? OPTIONAL_TABLE_VALUE,
    );
    await expect(detailsPanel).toContainText(
      requirement.owner ?? OPTIONAL_TABLE_VALUE,
    );
    await expect(detailsPanel).toContainText(
      requirement.source ?? OPTIONAL_TABLE_VALUE,
    );
  },
);

Then(
  "the requirement key copied toast should be visible for requirement {string}",
  async ({ page }, requirementKey: string) => {
    await expect(page.getByText("Requirement key copied")).toBeVisible();
    await expect(
      page.getByText(`${requirementKey} has been copied to the clipboard.`),
    ).toBeVisible();
    await expect
      .poll(async () => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(requirementKey);
  },
);

Then(
  "the URL should point to the details route for requirement {string}",
  async ({ page }, requirementKey: string) => {
    await expect(page).toHaveURL(
      new RegExp(
        `${escapeRegExp(getRequirementDetailsRoute(requirementKey))}$`,
        "u",
      ),
    );
  },
);

Then(
  "the full requirement details page should show requirement {string}",
  async ({ page }, requirementKey: string) => {
    const requirement = requireRequirementByKey(requirementKey);

    await expect(getRequirementTable(page)).toHaveCount(0);
    await expect(
      getRequirementDetailsPanel(page).getByRole("heading", {
        name: requirement.visibleKey,
      }),
    ).toBeVisible();
    await expect(getRequirementDetailsPanel(page)).toContainText(
      requirement.description ?? OPTIONAL_TABLE_VALUE,
    );
  },
);

Then(
  "the URL should point to the requirements list route",
  async ({ page }) => {
    await expect(page).toHaveURL(
      new RegExp(`${escapeRegExp(getRequirementListRoute())}$`, "u"),
    );
  },
);

Then("the requirements table should be visible again", async ({ page }) => {
  await expect(getRequirementTable(page)).toBeVisible();
});
