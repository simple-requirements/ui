import { expect, type Page } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import {
    createTestProject,
    E2E_DEVELOPER_USER_ID,
    E2E_VIEWER_USER_ID,
    getUserById,
    listProjectMemberships,
    openAuthenticatedRoute,
    removeProjectMembership,
    resetTestBackend,
    setProjectMembership,
    type Project,
    type ProjectRole,
    type UserAdministration,
} from './authenticated-test-backend';

const { Given, When, Then } = createBdd(test);

type MembershipContext = { project: Project; usersByDisplayName: Map<string, UserAdministration> };

let context: MembershipContext | undefined;

const projectRoleOrder: readonly ProjectRole[] = ['requirements_engineer', 'developer', 'viewer'];

function requireContext(): MembershipContext {
    if (context === undefined) {
        throw new Error('Project membership test context was not created.');
    }
    return context;
}

function roleValue(label: string): ProjectRole {
    switch (label.trim()) {
        case 'Requirements Engineer':
            return 'requirements_engineer';
        case 'Developer':
            return 'developer';
        case 'Viewer':
            return 'viewer';
        default:
            throw new Error(`Unknown project role: ${label}`);
    }
}

function roleLabels(value: string): string[] {
    return value.split(',').map((label) => label.trim());
}

function normalizeProjectRoles(roles: readonly ProjectRole[]): ProjectRole[] {
    return projectRoleOrder.filter((role) => roles.includes(role));
}

function expectedRoleValues(roles: string): ProjectRole[] {
    return normalizeProjectRoles(roleLabels(roles).map(roleValue));
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function membershipRow(page: Page, displayName: string) {
    return page.getByRole('row', { name: new RegExp(escapeRegExp(displayName), 'u') });
}

function currentRolesCell(page: Page, displayName: string) {
    return membershipRow(page, displayName).getByRole('cell').first();
}

async function selectMembershipAdministrationProject(page: Page): Promise<void> {
    const projectSelect = page.getByRole('combobox', { name: 'Project', exact: true });

    await expect(projectSelect).toBeVisible({ timeout: 10_000 });
    await projectSelect.selectOption(requireContext().project.id);
    await expect(projectSelect).toHaveValue(requireContext().project.id);
    await expect(page.getByRole('region', { name: requireContext().project.name })).toBeVisible({ timeout: 10_000 });
}

async function reopenMembershipAdministration(page: Page): Promise<void> {
    await openAuthenticatedRoute(page, '/administration/project-memberships');
    await expect(page).toHaveURL(/\/administration\/project-memberships$/u);
    await selectMembershipAdministrationProject(page);
}

async function expectBackendMembershipRoles(displayName: string, roles: readonly ProjectRole[]): Promise<void> {
    const user = userByDisplayName(displayName);
    const expectedRoles = normalizeProjectRoles(roles);

    await expect
        .poll(
            async () => {
                const memberships = await listProjectMemberships(requireContext().project.id);
                return normalizeProjectRoles(
                    memberships.find((membership) => membership.userId === user.id)?.roles ?? [],
                );
            },
            { message: `${displayName} should have project roles ${expectedRoles.join(', ')}`, timeout: 10_000 },
        )
        .toEqual(expectedRoles);
}

async function expectBackendMembershipRemoved(displayName: string): Promise<void> {
    const user = userByDisplayName(displayName);

    await expect
        .poll(
            async () => {
                const memberships = await listProjectMemberships(requireContext().project.id);
                return memberships.some((membership) => membership.userId === user.id);
            },
            { message: `${displayName} should no longer have a project membership`, timeout: 10_000 },
        )
        .toBe(false);
}

async function expectVisibleMembershipRoles(page: Page, displayName: string, roles: readonly string[]): Promise<void> {
    const row = membershipRow(page, displayName);
    await expect(row).toBeVisible({ timeout: 10_000 });
    const currentRoles = currentRolesCell(page, displayName);

    for (const role of roles) {
        await expect(currentRoles).toContainText(role);
    }
}

function userByDisplayName(displayName: string): UserAdministration {
    const user = requireContext().usersByDisplayName.get(displayName);
    if (user === undefined) {
        throw new Error(`Unknown user: ${displayName}`);
    }
    return user;
}

Given('the frontend project-membership administration API is available', async ({}) => {
    await resetTestBackend();
    const project = await createTestProject('Project Alpha');
    const viewer = await getUserById(E2E_VIEWER_USER_ID);
    const developer = await getUserById(E2E_DEVELOPER_USER_ID);
    await setProjectMembership(project.id, viewer.id, ['viewer']);

    context = {
        project,
        usersByDisplayName: new Map([
            [viewer.displayName, viewer],
            [developer.displayName, developer],
        ]),
    };
});

When('I sign in as a frontend Administrator', async ({ page }) => {
    await openAuthenticatedRoute(page, '/');
});

When('I open frontend project membership administration', async ({ page }) => {
    await reopenMembershipAdministration(page);
});

When('I select the administration project {string}', async ({ page }, projectName: string) => {
    if (projectName !== requireContext().project.name) {
        throw new Error(`Expected project "${requireContext().project.name}" but got "${projectName}".`);
    }

    await selectMembershipAdministrationProject(page);
});

Then('{string} should have the project role {string}', async ({ page }, displayName: string, role: string) => {
    await expectBackendMembershipRoles(displayName, [roleValue(role)]);
    await expectVisibleMembershipRoles(page, displayName, [role]);
});

Then('{string} should have the project roles {string}', async ({ page }, displayName: string, roles: string) => {
    await expectBackendMembershipRoles(displayName, expectedRoleValues(roles));
    await expectVisibleMembershipRoles(page, displayName, roleLabels(roles));
});

When('I assign {string} the project roles {string}', async ({ page }, displayName: string, roles: string) => {
    const user = userByDisplayName(displayName);
    const expectedRoles = expectedRoleValues(roles);

    const membership = await setProjectMembership(requireContext().project.id, user.id, expectedRoles);
    expect(normalizeProjectRoles(membership.roles)).toEqual(expectedRoles);

    await reopenMembershipAdministration(page);
    await expectBackendMembershipRoles(displayName, expectedRoles);
    await expectVisibleMembershipRoles(page, displayName, roleLabels(roles));
});

When('I change {string} to the project role {string}', async ({ page }, displayName: string, role: string) => {
    const user = userByDisplayName(displayName);
    const selectedRole = roleValue(role);

    const membership = await setProjectMembership(requireContext().project.id, user.id, [selectedRole]);
    expect(normalizeProjectRoles(membership.roles)).toEqual([selectedRole]);

    await reopenMembershipAdministration(page);
    await expectBackendMembershipRoles(displayName, [selectedRole]);
    await expectVisibleMembershipRoles(page, displayName, [role]);
});

When('I remove {string} from the project', async ({ page }, displayName: string) => {
    await removeProjectMembership(requireContext().project.id, userByDisplayName(displayName).id);
    await reopenMembershipAdministration(page);
    await expectBackendMembershipRemoved(displayName);
});

Then('{string} should no longer have a project membership', async ({ page }, displayName: string) => {
    await expectBackendMembershipRemoved(displayName);
    await expect(membershipRow(page, displayName)).toHaveCount(0);
});
