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
} from '@/api/reviewTasksApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { actionBarStore, closeReviewAssignmentDialog } from '@/stores/actionBarStore';

export type ReviewTasksPanelProps = Readonly<{ projectId: string; requirementId: string; canAssign: boolean }>;

export function ReviewTasksPanel({ projectId, requirementId, canAssign }: ReviewTasksPanelProps) {
    const dialogRequested = useSelector(actionBarStore, (state) => state.reviewAssignmentDialogOpen === true);
    const dialogVisible = canAssign && dialogRequested;
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
        enabled: canAssign && dialogVisible,
    });
    const pendingAssigneeIds = useMemo(
        () =>
            new Set(
                (tasksQuery.data ?? []).filter((task) => task.status === 'pending').map((task) => task.assignee.userId),
            ),
        [tasksQuery.data],
    );
    const assignees = (assigneesQuery.data ?? []).filter((assignee) => !pendingAssigneeIds.has(assignee.userId));

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
            closeReviewAssignmentDialog();
            setAssigneeUserId(undefined);
        } catch {
            setError('Review task could not be assigned.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <section aria-labelledby='review-task-heading'>
            <div className='project-requirement-review-page__task-header'>
                <h2 id='review-task-heading'>Review assignments</h2>
            </div>
            {tasksQuery.isError && <InlineStatus kind='error'>Review assignments could not be loaded.</InlineStatus>}
            {!tasksQuery.isLoading && (tasksQuery.data?.length ?? 0) === 0 && <p>No review tasks assigned.</p>}
            {(tasksQuery.data?.length ?? 0) > 0 && (
                <ul className='project-requirement-review-page__task-list'>
                    {tasksQuery.data?.map((task) => (
                        <li key={task.id}>
                            <strong>{task.assignee.displayName}</strong>
                            <span>{task.status === 'pending' ? 'Pending' : 'Completed'}</span>
                            <small>Assigned by {task.assignedBy.displayName}</small>
                        </li>
                    ))}
                </ul>
            )}
            <Dialog
                header='Assign review task'
                visible={dialogVisible}
                modal
                onHide={closeReviewAssignmentDialog}>
                <div className='project-requirement-review-page__assign-dialog'>
                    <label htmlFor='review-task-assignee'>Requirements Engineer</label>
                    <Dropdown
                        inputId='review-task-assignee'
                        value={assigneeUserId}
                        options={assignees}
                        optionLabel='displayName'
                        optionValue='userId'
                        placeholder='Select an engineer'
                        className='ui-control'
                        onChange={(event) =>
                            setAssigneeUserId(typeof event.value === 'string' ? event.value : undefined)
                        }
                    />
                    {assigneesQuery.isLoading && <p>Loading eligible engineers …</p>}
                    {!assigneesQuery.isLoading && assignees.length === 0 && <p>No eligible engineer is available.</p>}
                    {error !== undefined && <InlineStatus kind='error'>{error}</InlineStatus>}
                    <div className='project-requirement-review-page__dialog-actions'>
                        <Button
                            label='Cancel'
                            className='ui-button ui-button--outline'
                            onClick={closeReviewAssignmentDialog}
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
        </section>
    );
}
