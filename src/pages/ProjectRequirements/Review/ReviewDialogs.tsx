import type { ReviewComment, ReviewSummary } from "@/api/reviewApi";
import { RequirementLifecycleDialog } from "@/pages/ProjectRequirements/RequirementLifecycleDialog";
import { ReviewNameDialog } from "@/pages/ProjectRequirements/Review/ReviewNameDialog";
import { ReviewTextDialog } from "@/pages/ProjectRequirements/Review/ReviewTextDialog";
import type { ReviewComposer } from "@/pages/ProjectRequirements/Review/reviewPageTypes";
import { clearReviewDecisionRequest } from "@/stores/actionBarStore";

type ReviewDialogsProps = Readonly<{
  composer: ReviewComposer | undefined;
  commentToResolve: ReviewComment | undefined;
  decisionRequest: "approve" | "reject" | undefined;
  summary: ReviewSummary | undefined;
  visible: boolean;
  pending: boolean;
  onAbortComposer: () => void;
  onSubmitComposer: (text: string) => void | Promise<void>;
  onAbortResolve: () => void;
  onResolveComment: () => void | Promise<void>;
  onConfirmDecision: (reason?: string) => void | Promise<void>;
}>;

function getComposerDialogKey(composer: ReviewComposer | undefined): string {
  return composer?.mode === "reply"
    ? composer.comment.id
    : (composer?.mode ?? "closed");
}

function getComposerDialogTitle(composer: ReviewComposer | undefined): string {
  return composer?.mode === "reply" ? "Reply to comment" : "Create comment";
}

function getComposerDialogTextLabel(composer: ReviewComposer | undefined): string {
  return composer?.mode === "reply" ? "Reply" : "Comment";
}

function getReviewDecisionWarning(
  decisionRequest: "approve" | "reject" | undefined,
  openCommentCount: number,
): string | undefined {
  if (openCommentCount === 0) return undefined;

  if (decisionRequest === "reject") {
    return `Rejecting this requirement closes ${String(openCommentCount)} open comment${openCommentCount === 1 ? "" : "s"} as “requirement rejected”.`;
  }

  if (decisionRequest === "approve") {
    return "All open comments must be resolved before approval.";
  }

  return undefined;
}

export function ReviewDialogs({
  composer,
  commentToResolve,
  decisionRequest,
  summary,
  visible,
  pending,
  onAbortComposer,
  onSubmitComposer,
  onAbortResolve,
  onResolveComment,
  onConfirmDecision,
}: ReviewDialogsProps) {
  const openCommentCount = summary?.openCommentCount ?? 0;

  return (
    <>
      <ReviewTextDialog
        key={getComposerDialogKey(composer)}
        visible={composer !== undefined && visible}
        title={getComposerDialogTitle(composer)}
        textLabel={getComposerDialogTextLabel(composer)}
        confirmLabel={getComposerDialogTextLabel(composer)}
        pending={pending}
        onAbort={onAbortComposer}
        onConfirm={onSubmitComposer}
      />
      <ReviewNameDialog
        key={commentToResolve?.id ?? "closed"}
        visible={commentToResolve !== undefined && visible}
        pending={pending}
        onAbort={onAbortResolve}
        onConfirm={onResolveComment}
      />
      <RequirementLifecycleDialog
        key={decisionRequest ?? "closed"}
        visible={decisionRequest !== undefined && visible}
        title={
          decisionRequest === "reject"
            ? "Reject requirement"
            : "Approve requirement"
        }
        reasonRequired={decisionRequest === "reject"}
        warning={getReviewDecisionWarning(decisionRequest, openCommentCount)}
        confirmationBlocked={decisionRequest === "approve" && openCommentCount > 0}
        pending={pending}
        onAbort={clearReviewDecisionRequest}
        onConfirm={onConfirmDecision}
      />
    </>
  );
}
