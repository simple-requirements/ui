import { eq, useLiveQuery } from "@tanstack/react-db";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getProjectRequirementsCollection } from "@/api/collections/projectRequirementsCollection";
import { getReviewSummary, listReviewComments } from "@/api/reviewApi";

export function useReviewQueries(
  projectId: string | undefined,
  requirementId: string | undefined,
) {
  const collection = useMemo(
    () =>
      projectId === undefined
        ? undefined
        : getProjectRequirementsCollection(projectId),
    [projectId],
  );

  const requirementQuery = useLiveQuery(
    (query) =>
      collection === undefined || requirementId === undefined
        ? undefined
        : query
            .from({ requirements: collection })
            .where(({ requirements }) => eq(requirements.id, requirementId))
            .findOne(),
    [collection, requirementId],
  );

  const commentsQuery = useQuery({
    queryKey: ["review-comments", projectId, requirementId],
    queryFn: () => {
      if (projectId === undefined || requirementId === undefined) {
        throw new Error("Review comment identifiers are missing.");
      }

      return listReviewComments(projectId, requirementId);
    },
    enabled: projectId !== undefined && requirementId !== undefined,
  });

  const summaryQuery = useQuery({
    queryKey: ["review-summary", projectId, requirementId],
    queryFn: () => {
      if (projectId === undefined || requirementId === undefined) {
        throw new Error("Review summary identifiers are missing.");
      }

      return getReviewSummary(projectId, requirementId);
    },
    enabled: projectId !== undefined && requirementId !== undefined,
  });

  return {
    requirementQuery,
    commentsQuery,
    summaryQuery,
    requirement: requirementQuery.data,
    comments: commentsQuery.data ?? [],
    summary: summaryQuery.data,
    loading:
      requirementQuery.isLoading ||
      commentsQuery.isLoading ||
      summaryQuery.isLoading,
    error:
      requirementQuery.isError || commentsQuery.isError || summaryQuery.isError,
  };
}
