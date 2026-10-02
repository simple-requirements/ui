import { Splitter, SplitterPanel } from 'primereact/splitter';

import type { Requirement } from '@/api/requirementsApi';
import type { ReviewComment } from '@/api/reviewApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { RequirementDetailsPanel } from '@/pages/ProjectRequirements/RequirementDetailsPanel';
import { ReviewCommentsPanel } from '@/pages/ProjectRequirements/Review/ReviewCommentsPanel';
import { ReviewTasksPanel } from '@/pages/ProjectRequirements/Review/ReviewTasksPanel';

export type ReviewWorkspaceProps = Readonly<{
    requirement: Requirement;
    comments: readonly ReviewComment[];
    pending: boolean;
    readOnly: boolean;
    projectId: string;
    onComment: () => void;
    onReply: (comment: ReviewComment) => void;
    onResolve: (comment: ReviewComment) => void;
}>;

export function ReviewWorkspace({
    requirement,
    comments,
    pending,
    readOnly,
    projectId,
    onComment,
    onReply,
    onResolve,
}: ReviewWorkspaceProps) {
    const unresolvedMetricKeys =
        requirement.metricReferences?.filter((reference) => !reference.resolved).map((reference) => reference.key)
        ?? [];

    return (
        <Splitter pt={{ root: { className: 'project-requirement-review-page__splitter' } }}>
            <SplitterPanel
                size={50}
                minSize={30}>
                <div className='project-requirement-review-page__details'>
                    {unresolvedMetricKeys.length > 0 && (
                        <InlineStatus kind='error'>
                            Unresolved metric references block approval: {unresolvedMetricKeys.join(', ')}.
                        </InlineStatus>
                    )}
                    <RequirementDetailsPanel
                        requirement={requirement}
                        title={requirement.visibleKey}
                        titleElement='h1'
                    />
                </div>
            </SplitterPanel>
            <SplitterPanel
                size={50}
                minSize={30}>
                <div className='project-requirement-review-page__review-side'>
                    <ReviewTasksPanel
                        projectId={projectId}
                        requirementId={requirement.id}
                        canAssign={!readOnly}
                    />
                    <ReviewCommentsPanel
                        comments={comments}
                        pending={pending}
                        readOnly={readOnly}
                        onComment={onComment}
                        onReply={onReply}
                        onResolve={onResolve}
                    />
                </div>
            </SplitterPanel>
        </Splitter>
    );
}
