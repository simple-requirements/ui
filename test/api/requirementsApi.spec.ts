import { afterEach, describe, expect, it, vi } from "vitest";

import type * as FetchModule from "@/api/fetch";
import {
  getListProjectRequirementsQueryKey,
  listProjectRequirementsRequest,
  markProjectRequirementObsoleteRequest,
  implementationTicketSchema,
  requirementSchema,
} from "@/api/requirementsApi";

const mocks = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock("@/api/fetch", async (importOriginal) => {
  const actual = await importOriginal<typeof FetchModule>();

  return { ...actual, apiFetch: mocks.apiFetch };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("requirementsApi", () => {
  it("creates the list query key.", () => {
    expect(getListProjectRequirementsQueryKey("project-alpha")).toEqual([
      "/projects/project-alpha/requirements",
    ]);
  });

  it("parses a requirement.", () => {
    const requirement = requirementSchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
      projectId: "22222222-2222-4222-8222-222222222222",
      categoryId: "33333333-3333-4333-8333-333333333333",
      sequenceNumber: 1,
      revisionNumber: 2,
      visibleKey: "FR-AUTH-0001",
      status: "approved",
      description: "Users can sign in.",
      priority: "p1",
      owner: "Alice",
      rationale: null,
      source: null,
      rejectionReason: null,
      reviewer: "Bob",
      rejectedAt: null,
      deletedAt: null,
      approvedAt: "2026-06-29T11:00:00.000Z",
      implementedAt: null,
      obsoletedBy: null,
      obsolescenceReason: null,
      obsoleteAt: null,
      createdAt: "2026-06-28T10:00:00.000Z",
      updatedAt: "2026-06-29T11:30:00.000Z",
    });

    expect(requirement.visibleKey).toBe("FR-AUTH-0001");
    expect(requirement.status).toBe("approved");
  });

  it("parses an implementation ticket with a derived URL.", () => {
    expect(implementationTicketSchema.parse({
      id: "44444444-4444-4444-8444-444444444444",
      requirementId: "11111111-1111-4111-8111-111111111111",
      ticketId: "SOLAR-4711",
      completedBy: "Ada Lovelace",
      completedAt: "2026-08-26",
      url: "https://github.com/acme/issues/SOLAR-4711",
      createdAt: "2026-08-26T10:00:00.000Z",
      updatedAt: "2026-08-26T10:00:00.000Z",
    }).ticketId).toBe("SOLAR-4711");
  });

  it("lists and parses project requirements.", async () => {
    mocks.apiFetch.mockResolvedValue({
      data: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          projectId: "22222222-2222-4222-8222-222222222222",
          categoryId: "33333333-3333-4333-8333-333333333333",
          sequenceNumber: 1,
          revisionNumber: 1,
          visibleKey: "NFR-PERF-0001",
          status: "draft",
          description: null,
          priority: null,
          owner: null,
          rationale: null,
          source: null,
          rejectionReason: null,
          reviewer: null,
          rejectedAt: null,
          deletedAt: null,
          approvedAt: null,
          implementedAt: null,
          obsoletedBy: null,
          obsolescenceReason: null,
          obsoleteAt: null,
          createdAt: "2026-06-28T10:00:00.000Z",
          updatedAt: "2026-06-28T10:00:00.000Z",
        },
      ],
      status: 200,
      headers: new Headers(),
    });

    await expect(
      listProjectRequirementsRequest("project alpha"),
    ).resolves.toEqual([
      expect.objectContaining({
        id: "11111111-1111-4111-8111-111111111111",
        visibleKey: "NFR-PERF-0001",
        status: "draft",
      }),
    ]);

    expect(mocks.apiFetch).toHaveBeenCalledWith(
      "/projects/project alpha/requirements",
      { method: "GET" },
    );
  });

  it("marks a requirement obsolete with a reason.", async () => {
    mocks.apiFetch.mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        projectId: "22222222-2222-4222-8222-222222222222",
        categoryId: "33333333-3333-4333-8333-333333333333",
        sequenceNumber: 1,
        revisionNumber: 3,
        visibleKey: "FR-AUTH-0001",
        status: "obsolete",
        description: "Users can sign in.",
        priority: "p1",
        owner: "Alice",
        rationale: null,
        source: null,
        rejectionReason: null,
        reviewer: "Bob",
        rejectedAt: null,
        deletedAt: null,
        approvedAt: "2026-06-29T11:00:00.000Z",
        implementedAt: null,
        obsoletedBy: "Olivia Owner",
        obsolescenceReason: "Superseded by FR-AUTH-0002.",
        obsoleteAt: "2026-08-24T12:00:00.000Z",
        createdAt: "2026-06-28T10:00:00.000Z",
        updatedAt: "2026-08-24T12:00:00.000Z",
      },
      status: 200,
      headers: new Headers(),
    });

    await expect(
      markProjectRequirementObsoleteRequest(
        "22222222-2222-4222-8222-222222222222",
        "11111111-1111-4111-8111-111111111111",
        "Olivia Owner",
        "Superseded by FR-AUTH-0002.",
      ),
    ).resolves.toEqual(expect.objectContaining({ status: "obsolete" }));

    expect(mocks.apiFetch).toHaveBeenCalledWith(
      "/projects/22222222-2222-4222-8222-222222222222/requirements/11111111-1111-4111-8111-111111111111",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          status: "obsolete",
          obsoletedBy: "Olivia Owner",
          obsolescenceReason: "Superseded by FR-AUTH-0002.",
        }),
      }),
    );
  });
});
