import type { ProjectRole } from '@/auth/authTypes';

export type ProjectRoleOption = Readonly<{ value: ProjectRole; label: string }>;

export const projectRoleOptions = [
    { value: 'requirements_engineer', label: 'Requirements Engineer' },
    { value: 'developer', label: 'Developer' },
    { value: 'viewer', label: 'Viewer' },
] as const satisfies readonly ProjectRoleOption[];

export function normalizeProjectRoles(roles: readonly ProjectRole[]): ProjectRole[] {
    return projectRoleOptions.filter((option) => roles.includes(option.value)).map((option) => option.value);
}

export function sameProjectRoles(left: readonly ProjectRole[], right: readonly ProjectRole[]): boolean {
    const normalizedLeft = normalizeProjectRoles(left);
    const normalizedRight = normalizeProjectRoles(right);

    return (
        normalizedLeft.length === normalizedRight.length
        && normalizedLeft.every((role, index) => role === normalizedRight[index])
    );
}

export function projectRoleSummary(roles: readonly ProjectRole[]): string {
    return projectRoleOptions
        .filter((option) => roles.includes(option.value))
        .map((option) => option.label)
        .join(', ');
}

export function projectRolesFromValues(values: readonly unknown[]): ProjectRole[] {
    return normalizeProjectRoles(
        values.filter((value): value is ProjectRole => projectRoleOptions.some((option) => option.value === value)),
    );
}
