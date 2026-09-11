import { useSelector } from "@tanstack/react-store";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { queryClient } from "@/api/queryClient";
import { getListProjectRequirementsQueryKey } from "@/api/requirementsApi";
import {
  approveReview,
  createReviewComment,
  createReviewReply,
  rejectReview,
  resolveReviewComment,
  type ReviewComment,
} from "@/api/reviewApi";
import { useProjectPermissions } from "@/auth/projectPermissions";
import { InlineStatus } from "@/components/Feedback/InlineStatus";
import { LoadableContent } from "@/components/Feedback/LoadableContent";
import { toastMessages } from "@/components/Feedback/AppToast/toastMessages";
import { ReviewDialogs } from "@/pages/ProjectRequirements/Review/ReviewDialogs";
import { ReviewWorkspace } from "@/pages/ProjectRequirements/Review/ReviewWorkspace";
import type { ReviewComposer } from "@/pages/ProjectRequirements/Review/reviewPageTypes";
import { useReviewMutationRunner } from "@/pages/ProjectRequirements/Review/useReviewMutationRunner";
import { useReviewQueries } from "@/pages/ProjectRequirements/Review/useReviewQueries";
import { getProjectRequirementDetailsRoute } from "@/router/projectRoutes";
import {
  actionBarStore,
  clearReviewActionRequirement,
  clearReviewDecisionRequest,
  setReviewActionRequirement,
} from "@/stores/actionBarStore";

import "@/pages/ProjectRequirements/Review/ReviewPage.scss";

export function ReviewPage() {
  const { projectId, requirementId } = useParams();
  const navigate = useNavigate();
  const permissions = useProjectPermissions(projectId);
  const decisionRequest = useSelector(
    actionBarStore,
    (state) => state.reviewDecisionRequest,
  );
  const [composer, setComposer] = useState<ReviewComposer>();
  const [commentToResolve, setCommentToResolve] = useState<ReviewComment>();
  const { pending, runReviewAction } = useReviewMutationRunner(
    projectId,
    requirementId,
  );
  const {
    requirement,
    comments,
    summary,
    loading,
    error,
  } = useReviewQueries(projectId, requirementId);

  useEffect(() => {
    if (!permissions.canManageRequirements) {
      setComposer(undefined);
      setCommentToResolve(undefined);
      clearReviewDecisionRequest();
    }
  }, [permissions.canManageRequirements]);

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

  if (projectId === undefined || requirementId === undefined) {
    return <InlineStatus kind="error">Review route is incomplete.</InlineStatus>;
  }

  async function submitComposer(text: string): Promise<void> {
    const succeeded = await runReviewAction(
      () =>
        composer?.mode === "reply"
          ? createReviewReply(
              projectId,
              requirementId,
              composer.comment.id,
              text,
            )
          : createReviewComment(projectId, requirementId, text),
      composer?.mode === "reply"
        ? toastMessages.reviewReplyCreated()
        : toastMessages.reviewCommentCreated(),
    );

    if (succeeded) setComposer(undefined);
  }

  async function resolveComment(): Promise<void> {
    if (commentToResolve === undefined) return;

    const succeeded = await runReviewAction(
      () => resolveReviewComment(projectId, requirementId, commentToResolve.id),
      toastMessages.reviewCommentResolved(),
    );

    if (succeeded) setCommentToResolve(undefined);
  }

  async function confirmDecision(reason?: string): Promise<void> {
    const succeeded = await runReviewAction(
      async () => {
        const updatedRequirement =
          decisionRequest === "reject"
            ? await rejectReview(projectId, requirementId, reason ?? "")
            : await approveReview(projectId, requirementId);

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
      void navigate(getProjectRequirementDetailsRoute(projectId, requirementId));
    }
  }

  return (
    <section className="project-requirement-review-page">
      <LoadableContent
        loading={loading}
        error={error}
        empty={requirement === undefined}
        loadingMessage="Loading review …"
        errorMessage="Review could not be loaded."
        emptyMessage="Requirement could not be found."
      >
        {requirement !== undefined && (
          <ReviewWorkspace
            requirement={requirement}
            comments={comments}
            pending={pending}
            readOnly={!permissions.canManageRequirements}
            onComment={() => setComposer({ mode: "comment" })}
            onReply={(comment) => setComposer({ mode: "reply", comment })}
            onResolve={setCommentToResolve}
          />
        )}
      </LoadableContent>
      <ReviewDialogs
        composer={composer}
        commentToResolve={commentToResolve}
        decisionRequest={decisionRequest}
        summary={summary}
        visible={permissions.canManageRequirements}
        pending={pending}
        onAbortComposer={() => setComposer(undefined)}
        onSubmitComposer={submitComposer}
        onAbortResolve={() => setCommentToResolve(undefined)}
        onResolveComment={resolveComment}
        onConfirmDecision={confirmDecision}
      />
    </section>
  );
}
