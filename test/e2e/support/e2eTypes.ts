export type ProjectRole = "requirements_engineer" | "developer" | "viewer";

export type Project = Readonly<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  requirementCount?: number;
  ticketUrlTemplate?: string | null;
}>;

export type Category = Readonly<{
  id: string;
  projectId: string;
  name: string;
  key: string;
  type: "FR" | "NFR";
  createdAt: string;
  updatedAt: string;
  requirementCount?: number;
}>;

export type Requirement = Readonly<{
  id: string;
  projectId: string;
  categoryId: string;
  sequenceNumber: number;
  revisionNumber: number;
  visibleKey: string;
  status: "draft" | "approved" | "implemented" | "obsolete" | "rejected";
  description: string | null;
  priority: "p1" | "p2" | "p3" | null;
  owner: string | null;
  rationale: string | null;
  source: string | null;
  rejectionReason: string | null;
  reviewer: string | null;
  obsoletedBy: string | null;
  rejectedAt: string | null;
  deletedAt: string | null;
  approvedAt: string | null;
  implementedAt: string | null;
  obsolescenceReason: string | null;
  obsoleteAt: string | null;
  implementationTickets: readonly unknown[];
  createdAt: string;
  updatedAt: string;
}>;

export type UserAdministration = Readonly<{
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: "pending" | "active" | "deactivated";
  globalRoles: readonly string[];
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type Session = Readonly<{
  id: string;
  createdAt: string;
  lastActivityAt: string;
  revokedAt: string | null;
}>;

export type ProjectMembership = Readonly<{
  userId: string;
  username: string;
  displayName: string;
  roles: readonly ProjectRole[];
}>;

export type ImplementationTicket = Readonly<{
  id: string;
  requirementId: string;
  ticketId: string;
  completedBy: string;
  completedAt: string;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}>;
