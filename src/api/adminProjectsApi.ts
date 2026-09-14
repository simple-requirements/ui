import { z } from "zod";

import {
  adminCreateProject,
  adminDeleteProject,
  adminListProjects,
  adminUpdateProject,
} from "@/api/generated/project-administration/project-administration";
import type { ProjectRole } from "@/auth/authTypes";

const projectRoleSchema = z.enum([
  "requirements_engineer",
  "developer",
  "viewer",
]);

export const administratorProjectMembershipSchema = z.object({
  userId: z.uuid(),
  username: z.string(),
  displayName: z.string(),
  role: projectRoleSchema,
});

export const administratorProjectSummarySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  categoryNames: z.array(z.string()),
  categoryCount: z.number().int().nonnegative(),
  requirementCount: z.number().int().nonnegative(),
  memberships: z.array(administratorProjectMembershipSchema),
  ticketUrlTemplate: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

const administratorProjectSummariesSchema = z.array(
  administratorProjectSummarySchema,
);

export type AdministratorProjectMembership = Readonly<{
  userId: string;
  username: string;
  displayName: string;
  role: ProjectRole;
}>;

export type AdministratorProjectSummary = Readonly<{
  id: string;
  name: string;
  categoryNames: readonly string[];
  categoryCount: number;
  requirementCount: number;
  memberships: readonly AdministratorProjectMembership[];
  ticketUrlTemplate: string | null;
  createdAt: string;
  updatedAt: string;
}>;

function parseProject(data: unknown): AdministratorProjectSummary {
  return administratorProjectSummarySchema.parse(data);
}

/** Lists every project using Administrator-safe summary data only. */
export async function listAdministratorProjects(): Promise<
  AdministratorProjectSummary[]
> {
  const response = await adminListProjects();

  return administratorProjectSummariesSchema.parse(response.data);
}

export async function createAdministratorProject(
  name: string,
): Promise<AdministratorProjectSummary> {
  const response = await adminCreateProject({ name });

  return parseProject(response.data);
}

export async function updateAdministratorProject(
  projectId: string,
  data: Readonly<{ name?: string; ticketUrlTemplate?: string | null }>,
): Promise<AdministratorProjectSummary> {
  const response = await adminUpdateProject(projectId, data);

  return parseProject(response.data);
}

export async function deleteAdministratorProject(
  projectId: string,
): Promise<void> {
  await adminDeleteProject(projectId);
}
