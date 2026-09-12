import { Splitter, SplitterPanel } from 'primereact/splitter';

import type { Requirement } from '@/api/requirementsApi';
import type { ReviewComment } from '@/api/reviewApi';
import { RequirementDetailsPanel } from '@/pages/ProjectRequirements/RequirementDetailsPanel';
import { ReviewCommentsPanel } from '@/pages/ProjectRequirements/Review/ReviewCommentsPanel';

export type ReviewWorkspaceProps = Readonly<{
    requirement: Requirement;
    comments: readonly ReviewComment[];
    pending: boolean;
    readOnly: boolean;
    onComment: () => void;
    onReply: (comment: ReviewComment) => void;
    onResolve: (comment: ReviewComment) => void;
}>;

export function ReviewWorkspace({
    requirement,
    comments,
    pending,
    readOnly,
    onComment,
    onReply,
    onResolve,
}: ReviewWorkspaceProps) {
    return (
        <Splitter pt={{ root: { className: 'project-requirement-review-page__splitter' } }}>
            <SplitterPanel
                size={50}
                minSize={30}>
                <div className='project-requirement-review-page__details'>
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
                <ReviewCommentsPanel
                    comments={comments}
                    pending={pending}
                    readOnly={readOnly}
                    onComment={onComment}
                    onReply={onReply}
                    onResolve={onResolve}
                />
            </SplitterPanel>
        </Splitter>
    );
}
