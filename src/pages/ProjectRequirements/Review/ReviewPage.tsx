import { eq, useLiveQuery } from "@tanstack/react-db";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "@tanstack/react-store";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getProjectRequirementsCollection } from "@/api/collections/projectRequirementsCollection";
import { queryClient } from "@/api/queryClient";
import { getListProjectRequirementsQueryKey } from "@/api/requirementsApi";
import {
  approveReview,
  createReviewComment,
  createReviewReply,
  getReviewSummary,
  listReviewComments,
  rejectReview,
  resolveReviewComment,
  type ReviewComment,
} from "@/api/reviewApi";
import { InlineStatus } from "@/components/Feedback/InlineStatus";
import { LoadableContent } from "@/components/Feedback/LoadableContent";
import { toastMessages } from "@/components/Feedback/AppToast/toastMessages";
import type { AppToastMessage } from "@/stores/toastStore";
import { getProjectRequirementDetailsRoute } from "@/router/projectRoutes";
import {
  actionBarStore,
  clearReviewActionRequirement,
  clearReviewDecisionRequest,
  setReviewActionRequirement,
} from "@/stores/actionBarStore";
import { showToastMessage } from "@/stores/toastStore";
import { RequirementDetailsPanel } from "@/pages/ProjectRequirements/RequirementDetailsPanel";
import { RequirementLifecycleDialog } from "@/pages/ProjectRequirements/RequirementLifecycleDialog";
import { ReviewCommentsPanel } from "@/pages/ProjectRequirements/Review/ReviewCommentsPanel";
import { ReviewNameDialog } from "@/pages/ProjectRequirements/Review/ReviewNameDialog";
import { ReviewTextDialog } from "@/pages/ProjectRequirements/Review/ReviewTextDialog";

import "@/pages/ProjectRequirements/Review/ReviewPage.scss";

export function ReviewPage() {
  const { projectId, requirementId } = useParams();
  const navigate = useNavigate();
  const decisionRequest = useSelector(
    actionBarStore,
    (state) => state.reviewDecisionRequest,
  );
  const [composer, setComposer] = useState<
    { mode: "comment" } | { mode: "reply"; comment: ReviewComment }
  >();
  const [commentToResolve, setCommentToResolve] = useState<ReviewComment>();
  const [pending, setPending] = useState(false);
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
  const requirement = requirementQuery.data;

  useEffect(() => {
    if (projectId === undefined || requirement === undefined) {
      clearReviewActionRequirement();
      return;
    }
    setReviewActionRequirement({
      projectId,
      requirementId: requirement.id,
      visibleKey: requirement.visibleKey,
      status: requirement.status,
    });
    if (requirement.status !== "draft") {
      clearReviewDecisionRequest();
      void navigate(
        getProjectRequirementDetailsRoute(projectId, requirement.id),
        { replace: true },
      );
    }
  }, [navigate, projectId, requirement]);

  async function refreshReview(): Promise<void> {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["review-comments", projectId, requirementId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["review-summary", projectId, requirementId],
      }),
    ]);
  }

  async function run(
    action: () => Promise<unknown>,
    success: AppToastMessage,
  ): Promise<boolean> {
    setPending(true);
    try {
      await action();
      await refreshReview();
      showToastMessage(success);
      return true;
    } catch (error) {
      showToastMessage(
        toastMessages.reviewFailed(
          error instanceof Error
            ? error.message
            : "The review action could not be completed.",
        ),
      );
      return false;
    } finally {
      setPending(false);
    }
  }

  if (projectId === undefined || requirementId === undefined)
    return (
      <InlineStatus kind="error">Review route is incomplete.</InlineStatus>
    );
  const comments = commentsQuery.data ?? [];
  const summary = summaryQuery.data;

  return (
    <section className="project-requirement-review-page">
      <LoadableContent
        loading={
          requirementQuery.isLoading ||
          commentsQuery.isLoading ||
          summaryQuery.isLoading
        }
        error={
          requirementQuery.isError ||
          commentsQuery.isError ||
          summaryQuery.isError
        }
        empty={requirement === undefined}
        loadingMessage="Loading review …"
        errorMessage="Review could not be loaded."
        emptyMessage="Requirement could not be found."
      >
        {requirement !== undefined && (
          <Splitter
            pt={{
              root: { className: "project-requirement-review-page__splitter" },
            }}
          >
            <SplitterPanel size={50} minSize={30}>
              <div className="project-requirement-review-page__details">
                <RequirementDetailsPanel
                  requirement={requirement}
                  title={requirement.visibleKey}
                  titleElement="h1"
                />
              </div>
            </SplitterPanel>
            <SplitterPanel size={50} minSize={30}>
              <ReviewCommentsPanel
                comments={comments}
                pending={pending}
                onComment={() => setComposer({ mode: "comment" })}
                onReply={(comment) => setComposer({ mode: "reply", comment })}
                onResolve={setCommentToResolve}
              />
            </SplitterPanel>
          </Splitter>
        )}
      </LoadableContent>
      <ReviewTextDialog
        key={
          composer?.mode === "reply"
            ? composer.comment.id
            : (composer?.mode ?? "closed")
        }
        visible={composer !== undefined}
        title={
          composer?.mode === "reply" ? "Reply to comment" : "Create comment"
        }
        textLabel={composer?.mode === "reply" ? "Reply" : "Comment"}
        confirmLabel={composer?.mode === "reply" ? "Reply" : "Comment"}
        pending={pending}
        onAbort={() => setComposer(undefined)}
        onConfirm={async (text, author) => {
          await run(
            () =>
              composer?.mode === "reply"
                ? createReviewReply(
                    projectId,
                    requirementId,
                    composer.comment.id,
                    text,
                    author,
                  )
                : createReviewComment(projectId, requirementId, text, author),
            composer?.mode === "reply"
              ? toastMessages.reviewReplyCreated()
              : toastMessages.reviewCommentCreated(),
          );
          setComposer(undefined);
        }}
      />
      <ReviewNameDialog
        key={commentToResolve?.id ?? "closed"}
        visible={commentToResolve !== undefined}
        pending={pending}
        onAbort={() => setCommentToResolve(undefined)}
        onConfirm={async (name) => {
          if (commentToResolve === undefined) return;
          const succeeded = await run(
            () =>
              resolveReviewComment(
                projectId,
                requirementId,
                commentToResolve.id,
                name,
              ),
            toastMessages.reviewCommentResolved(),
          );
          if (succeeded) setCommentToResolve(undefined);
        }}
      />
      <RequirementLifecycleDialog
        key={decisionRequest ?? "closed"}
        visible={decisionRequest !== undefined}
        title={
          decisionRequest === "reject"
            ? "Reject requirement"
            : "Approve requirement"
        }
        reasonRequired={decisionRequest === "reject"}
        warning={
          (summary?.openCommentCount ?? 0) > 0
            ? decisionRequest === "reject"
              ? `Rejecting this requirement closes ${String(summary?.openCommentCount ?? 0)} open comment${summary?.openCommentCount === 1 ? "" : "s"} as “requirement rejected”.`
              : "All open comments must be resolved before approval."
            : undefined
        }
        confirmationBlocked={
          decisionRequest === "approve" && (summary?.openCommentCount ?? 0) > 0
        }
        pending={pending}
        onAbort={clearReviewDecisionRequest}
        onConfirm={async (reviewer, reason) => {
          const succeeded = await run(
            async () => {
              const decidedRequirement =
                decisionRequest === "reject"
                  ? rejectReview(
                      projectId,
                      requirementId,
                      reviewer,
                      reason ?? "",
                    )
                  : approveReview(projectId, requirementId, reviewer);
              const updatedRequirement = await decidedRequirement;
              setReviewActionRequirement({
                projectId,
                requirementId: updatedRequirement.id,
                visibleKey: updatedRequirement.visibleKey,
                status: updatedRequirement.status,
              });
              await queryClient.invalidateQueries({
                queryKey: getListProjectRequirementsQueryKey(projectId),
              });
              return updatedRequirement;
            },
            decisionRequest === "reject"
              ? toastMessages.requirementRejected(
                  requirement?.visibleKey ?? "The requirement",
                )
              : toastMessages.requirementApproved(
                  requirement?.visibleKey ?? "The requirement",
                ),
          );
          if (succeeded) {
            clearReviewDecisionRequest();
            void navigate(
              getProjectRequirementDetailsRoute(projectId, requirementId),
            );
          }
        }}
      />
    </section>
  );
}
