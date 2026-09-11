import type { ReviewComment } from "@/api/reviewApi";

export type ReviewComposer =
  | { mode: "comment" }
  | { mode: "reply"; comment: ReviewComment };
