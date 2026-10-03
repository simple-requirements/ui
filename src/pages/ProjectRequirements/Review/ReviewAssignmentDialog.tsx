import { useQuery } from '@tanstack/react-query';
import { useSelector } from '@tanstack/react-store';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { useMemo, useState } from 'react';

import { queryClient } from '@/api/queryClient';
import {
    assignReviewTask,
    getMyReviewTasksQueryKey,
    getRequirementReviewTasksQueryKey,
    getReviewAssigneesQueryKey,
    listRequirementReviewTasks,
    listReviewAssignees,
    type ReviewTask,
    type ReviewTaskAssignee,
} from '@/api/reviewTasksApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { actionBarStore, closeReviewAssignmentDialog } from '@/stores/actionBarStore';

import '@/pages/ProjectRequirements/Review/ReviewAssignmentDialog.scss';

export type ReviewAssignmentDialogProps = Readonly<{ projectId: string; requirementId: string }>;

/** Renders the ActionBar-controlled reviewer assignment dialog for one requirement. */
export function ReviewAssignmentDialog({ projectId, requirementId }: ReviewAssignmentDialogProps) {
    const visible = useSelector(actionBarStore, (state) => state.reviewAssignmentDialogOpen === true);
    const [assigneeUserId, setAssigneeUserId] = useState<string>();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>();
    const tasksQuery = useQuery({
        queryKey: getRequirementReviewTasksQueryKey(projectId, requirementId),
        queryFn: () => listRequirementReviewTasks(projectId, requirementId),
    });
    const assigneesQuery = useQuery({
        queryKey: getReviewAssigneesQueryKey(projectId),
        queryFn: () => listReviewAssignees(projectId),
        enabled: visible,
    });
    const reviewTasks: readonly ReviewTask[] = Array.isArray(tasksQuery.data) ? tasksQuery.data : [];
    const reviewAssignees: readonly ReviewTaskAssignee[] = Array.isArray(assigneesQuery.data) ? assigneesQuery.data : [];
    const pendingAssigneeIds = useMemo(
        () =>
            new Set(
                reviewTasks.filter((task) => task.status === 'pending').map((task) => task.assignee.userId),
            ),
        [reviewTasks],
    );
    const assignees = reviewAssignees.filter((assignee) => !pendingAssigneeIds.has(assignee.userId));

    function close(): void {
        closeReviewAssignmentDialog();
        setAssigneeUserId(undefined);
        setError(undefined);
    }

    async function assign(): Promise<void> {
        if (assigneeUserId === undefined) return;
        setSaving(true);
        setError(undefined);
        try {
            await assignReviewTask(projectId, requirementId, assigneeUserId);
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: getRequirementReviewTasksQueryKey(projectId, requirementId),
                }),
                queryClient.invalidateQueries({ queryKey: getMyReviewTasksQueryKey(projectId) }),
            ]);
            close();
        } catch {
            setError('Review task could not be assigned.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog
            header='Assign review task'
            visible={visible}
            modal
            onHide={close}>
            <div className='project-requirement-review-assignment-dialog'>
                <label htmlFor='review-task-assignee'>Requirements Engineer</label>
                <Dropdown
                    inputId='review-task-assignee'
                    value={assigneeUserId}
                    options={assignees}
                    optionLabel='displayName'
                    optionValue='userId'
                    placeholder='Select an engineer'
                    className='ui-control'
                    onChange={(event) => setAssigneeUserId(typeof event.value === 'string' ? event.value : undefined)}
                />
                {assigneesQuery.isLoading && <p>Loading eligible engineers …</p>}
                {!assigneesQuery.isLoading && assignees.length === 0 && <p>No eligible engineer is available.</p>}
                {error !== undefined && <InlineStatus kind='error'>{error}</InlineStatus>}
                <div className='project-requirement-review-assignment-dialog__actions'>
                    <Button
                        label='Cancel'
                        className='ui-button ui-button--outline'
                        onClick={close}
                    />
                    <Button
                        label='Assign'
                        className='ui-button ui-button--action'
                        disabled={assigneeUserId === undefined}
                        loading={saving}
                        onClick={() => void assign()}
                    />
                </div>
            </div>
        </Dialog>
    );
}
