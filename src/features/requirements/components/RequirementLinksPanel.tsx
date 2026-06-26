import { useState, type SyntheticEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { mapApiError } from '@/api/errors/apiError';
import { useConfirmDialog } from '@/shared/dialogs/ConfirmDialogProvider';
import { normalizeRequirementLinkTargetKey } from '@/features/requirements/api/requirementLinksApi';
import { validateVisibleKey } from '@/features/requirements/api/requirementsApi';
import {
    useCreateRequirementLinkMutation,
    useDeleteRequirementLinkMutation,
    useRequirementLinkHistoryQuery,
    useRequirementLinksQuery,
    useUpdateRequirementLinkMutation,
} from '@/features/requirements/api/requirementLinkQueries';
import type { RequirementLinkHistoryEventView, RequirementLinkView, RequirementView } from '@/types/domain';

type RequirementLinksPanelProps = Readonly<{
    requirement: RequirementView;
    onOpenRequirement?: (requirementId: string, visibleKey: string) => void;
}>;

type LinkListProps = Readonly<{
    title: string;
    emptyText: string;
    direction: 'outgoing' | 'incoming';
    links: readonly RequirementLinkView[];
    onCorrect: (linkId: string, targetVisibleKey: string) => void;
    onRemove: (linkId: string) => void;
    onOpenRequirement?: (requirementId: string, visibleKey: string) => void;
    pending: boolean;
}>;

const formatTime = (value: string) => new Date(value).toLocaleString();
const displayEvent = (event: RequirementLinkHistoryEventView) => {
    if (event.eventType === 'created')
        return `${event.sourceVisibleKey} started referencing ${event.newTargetVisibleKey ?? 'unknown target'}`;
    if (event.eventType === 'target_changed')
        return `${event.sourceVisibleKey} target changed from ${event.oldTargetVisibleKey ?? 'unknown target'} to ${event.newTargetVisibleKey ?? 'unknown target'}`;
    return `${event.sourceVisibleKey} stopped referencing ${event.oldTargetVisibleKey ?? event.newTargetVisibleKey ?? 'unknown target'}`;
};

function LinkList({
    title,
    emptyText,
    direction,
    links,
    onCorrect,
    onRemove,
    onOpenRequirement,
    pending,
}: LinkListProps) {
    return (
        <section
            className='requirement-links__group'
            aria-label={title}>
            <h4>{title}</h4>
            {links.length === 0 ?
                <p className='state state--inline'>{emptyText}</p>
            :   null}
            {links.length > 0 ?
                <ul className='requirement-links__list'>
                    {links.map((link) => (
                        <li
                            key={link.id}
                            className='requirement-links__item'>
                            <div>
                                <strong>
                                    {direction === 'outgoing' ? link.targetVisibleKey : link.sourceVisibleKey}
                                </strong>
                                <span className='requirement-links__meta'>
                                    {link.relationshipType} ·{' '}
                                    {direction === 'outgoing' ? link.targetStatus : link.sourceStatus}
                                </span>
                            </div>
                            <Button
                                type='button'
                                label='Open'
                                onClick={() =>
                                    direction === 'outgoing' ?
                                        onOpenRequirement?.(link.targetRequirementId, link.targetVisibleKey)
                                    :   onOpenRequirement?.(link.sourceRequirementId, link.sourceVisibleKey)
                                }
                            />
                            {direction === 'outgoing' ?
                                <form
                                    className='requirement-links__edit'
                                    aria-label={`Correct link target ${link.targetVisibleKey}`}
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        const value = new FormData(event.currentTarget).get('targetVisibleKey');
                                        onCorrect(link.id, typeof value === 'string' ? value : '');
                                    }}>
                                    <input
                                        key={`${link.id}:${link.targetVisibleKey}`}
                                        className='p-inputtext p-component'
                                        name='targetVisibleKey'
                                        defaultValue={link.targetVisibleKey}
                                        aria-label={`New target for ${link.targetVisibleKey}`}
                                    />
                                    <Button
                                        type='submit'
                                        label='Correct'
                                        severity='success'
                                        disabled={pending}
                                    />
                                    <Button
                                        type='button'
                                        label='Remove'
                                        severity='danger'
                                        disabled={pending}
                                        onClick={() => onRemove(link.id)}
                                    />
                                </form>
                            :   null}
                        </li>
                    ))}
                </ul>
            :   null}
        </section>
    );
}

/** Shows current incoming/outgoing links and link-history controls for one requirement. */
export function RequirementLinksPanel({ requirement, onOpenRequirement }: RequirementLinksPanelProps) {
    const queryClient = useQueryClient();
    const { confirm } = useConfirmDialog();
    const [targetVisibleKey, setTargetVisibleKey] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const linksQuery = useRequirementLinksQuery(requirement.id);
    const historyQuery = useRequirementLinkHistoryQuery(requirement.id);
    const createMutation = useCreateRequirementLinkMutation(queryClient, requirement.id);
    const updateMutation = useUpdateRequirementLinkMutation(queryClient, requirement.id);
    const deleteMutation = useDeleteRequirementLinkMutation(queryClient, requirement.id);
    const mutationPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
    const error = createMutation.error ?? updateMutation.error ?? deleteMutation.error;

    const handleCreate = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalizedTarget = normalizeRequirementLinkTargetKey(targetVisibleKey);
        setFeedback(null);
        if (!validateVisibleKey(normalizedTarget)) {
            setFeedback('Enter a valid target key, for example FR-UI-0001.');
            return;
        }
        createMutation.mutate(normalizedTarget, {
            onSuccess: () => {
                setTargetVisibleKey('');
                setFeedback(`Created link to ${normalizedTarget}.`);
            },
        });
    };

    const handleCorrect = (linkId: string, nextTargetVisibleKey: string) => {
        const normalizedTarget = normalizeRequirementLinkTargetKey(nextTargetVisibleKey);
        setFeedback(null);
        if (!validateVisibleKey(normalizedTarget)) {
            setFeedback('Enter a valid replacement target key, for example FR-UI-0001.');
            return;
        }
        updateMutation.mutate(
            { linkId, targetVisibleKey: normalizedTarget },
            { onSuccess: () => setFeedback(`Corrected link target to ${normalizedTarget}.`) },
        );
    };

    const handleRemove = (linkId: string) => {
        setFeedback(null);
        void confirm({
            title: 'Remove requirement link',
            message: 'Remove this requirement link?',
            acceptLabel: 'Remove',
            acceptSeverity: 'danger',
        }).then((confirmed) => {
            if (confirmed) deleteMutation.mutate(linkId, { onSuccess: () => setFeedback('Removed requirement link.') });
        });
    };

    return (
        <section
            className='requirement-links'
            aria-label={`Requirement links for ${requirement.visibleKey}`}>
            <header className='requirement-links__header'>
                <h3>Requirement links</h3>
                <p>Links are explicit references and are independent of the requirement description text.</p>
            </header>
            <form
                className='requirement-links__create'
                aria-label='Create requirement link'
                onSubmit={handleCreate}>
                <label>
                    Target key
                    <input
                        className='p-inputtext p-component'
                        value={targetVisibleKey}
                        onChange={(event) => setTargetVisibleKey(event.currentTarget.value)}
                        placeholder='FR-UI-0001'
                    />
                </label>
                <Button
                    type='submit'
                    label='Create link'
                    severity='success'
                    disabled={mutationPending}
                />
            </form>
            {feedback ?
                <p
                    className='requirement-links__feedback'
                    role='status'>
                    {feedback}
                </p>
            :   null}
            {error ?
                <p
                    className='requirement-links__feedback'
                    role='alert'>
                    {mapApiError(error).message}
                </p>
            :   null}
            {linksQuery.isFetching ?
                <div
                    className='state state--inline'
                    role='status'>
                    Loading requirement links…
                </div>
            : linksQuery.isError ?
                <div
                    className='state state--inline'
                    role='alert'>
                    {mapApiError(linksQuery.error).message}
                </div>
            :   <div className='requirement-links__grid'>
                    <LinkList
                        title='Outgoing links'
                        emptyText='No outgoing links.'
                        direction='outgoing'
                        links={linksQuery.data?.outgoingLinks ?? []}
                        onCorrect={handleCorrect}
                        onRemove={handleRemove}
                        onOpenRequirement={onOpenRequirement}
                        pending={mutationPending}
                    />
                    <LinkList
                        title='Incoming links'
                        emptyText='No incoming links.'
                        direction='incoming'
                        links={linksQuery.data?.incomingLinks ?? []}
                        onCorrect={handleCorrect}
                        onRemove={handleRemove}
                        onOpenRequirement={onOpenRequirement}
                        pending={mutationPending}
                    />
                </div>
            }
            <section
                className='requirement-links__history'
                aria-label='Requirement link history'>
                <h4>Link history</h4>
                {historyQuery.isFetching ?
                    <div
                        className='state state--inline'
                        role='status'>
                        Loading link history…
                    </div>
                : historyQuery.isError ?
                    <div
                        className='state state--inline'
                        role='alert'>
                        {mapApiError(historyQuery.error).message}
                    </div>
                : historyQuery.data?.length ?
                    <ol className='requirement-links__history-list'>
                        {historyQuery.data.map((event) => (
                            <li key={event.id}>
                                <strong>{event.eventType.replaceAll('_', ' ')}</strong> — {displayEvent(event)}{' '}
                                <time dateTime={event.occurredAt}>({formatTime(event.occurredAt)})</time>
                            </li>
                        ))}
                    </ol>
                :   <p className='state state--inline'>No link history.</p>}
            </section>
        </section>
    );
}
