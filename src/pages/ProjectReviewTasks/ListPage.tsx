import { useQuery } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import {
    getMyReviewTasksQueryKey,
    listMyReviewTasks,
    updateReviewTaskStatus,
    type ReviewTask,
} from '@/api/reviewTasksApi';
import { queryClient } from '@/api/queryClient';
import { InlineStatus } from '@/components/Feedback/InlineStatus';
import { getProjectRequirementReviewRoute } from '@/router/projectRoutes';

import '@/pages/ProjectReviewTasks/ListPage.scss';

export function ListPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [showCompleted, setShowCompleted] = useState(false);
    const [pendingTaskId, setPendingTaskId] = useState<string>();
    const query = useQuery({
        queryKey: getMyReviewTasksQueryKey(projectId),
        queryFn: () => listMyReviewTasks(projectId ?? ''),
        enabled: projectId !== undefined,
    });
    const tasks = useMemo(
        () => (query.data ?? []).filter((task) => showCompleted || task.status === 'pending'),
        [query.data, showCompleted],
    );

    async function complete(task: ReviewTask): Promise<void> {
        if (projectId === undefined) return;
        setPendingTaskId(task.id);
        try {
            await updateReviewTaskStatus(projectId, task.requirementId, task.id, 'completed');
            await queryClient.invalidateQueries({ queryKey: getMyReviewTasksQueryKey(projectId) });
        } finally {
            setPendingTaskId(undefined);
        }
    }

    if (projectId === undefined) return <InlineStatus kind='error'>Project route is incomplete.</InlineStatus>;

    return (
        <section className='project-review-tasks-page'>
            <header className='project-review-tasks-page__header'>
                <div>
                    <h1>My review tasks</h1>
                    <p>Requirements assigned to you for review in this project.</p>
                </div>
                <label className='project-review-tasks-page__toggle'>
                    <Checkbox
                        inputId='show-completed-review-tasks'
                        checked={showCompleted}
                        onChange={(event) => setShowCompleted(event.checked ?? false)}
                    />
                    <span>Show completed</span>
                </label>
            </header>
            {query.isError && <InlineStatus kind='error'>Review tasks could not be loaded.</InlineStatus>}
            <DataTable
                value={tasks}
                loading={query.isLoading}
                dataKey='id'
                emptyMessage={showCompleted ? 'No review tasks.' : 'No pending review tasks.'}
                pt={{ table: { 'aria-label': 'My review tasks' } }}>
                <Column
                    field='requirementKey'
                    header='Requirement'
                    sortable
                />
                <Column
                    field='requirementDescription'
                    header='Description'
                />
                <Column
                    field='assignedBy.displayName'
                    header='Assigned by'
                    sortable
                />
                <Column
                    field='status'
                    header='Status'
                    sortable
                />
                <Column
                    header='Actions'
                    body={(task: ReviewTask) => (
                        <div className='project-review-tasks-page__actions'>
                            <Button
                                label='Open review'
                                className='ui-button ui-button--outline'
                                onClick={() =>
                                    void navigate(getProjectRequirementReviewRoute(projectId, task.requirementId))
                                }
                            />
                            {task.status === 'pending' && (
                                <Button
                                    label='Mark completed'
                                    className='ui-button ui-button--action'
                                    loading={pendingTaskId === task.id}
                                    onClick={() => void complete(task)}
                                />
                            )}
                        </div>
                    )}
                />
            </DataTable>
        </section>
    );
}
