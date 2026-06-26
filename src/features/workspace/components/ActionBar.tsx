import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState, type ComponentProps, type SyntheticEvent } from 'react';
import type { RequirementLifecycleCommand } from '@/features/requirements/api/requirementLifecycleMutation';
import type { Action } from '@/state/workspaceReducer';
import type { RequirementView } from '@/types/domain';

type ActionBarProps = Readonly<{
    activeProjectId: string | null;
    selectedRequirement: RequirementView | null;
    canCreateRequirement?: boolean;
    createUnavailableReason?: string;
    dedicated?: boolean;
    dispatch: (action: Action) => void;
    lookupPending?: boolean;
    lifecycleMessage?: string | null;
    lifecyclePending?: boolean;
    onLifecycleAction?: (command: RequirementLifecycleCommand, requirement: RequirementView) => void;
    onLookup?: (visibleKey: string) => void;
}>;

type ActionBarButtonProps = Readonly<ComponentProps<typeof Button>>;

function ActionBarButton(props: ActionBarButtonProps) {
    return (
        <Button
            outlined
            {...props}
        />
    );
}

/** Renders context actions for the selected current requirement without exposing actions for historical snapshots. */
export function ActionBar({
    activeProjectId,
    selectedRequirement,
    dedicated = false,
    dispatch,
    canCreateRequirement = false,
    createUnavailableReason = 'Select a loaded project and load categories before creating a requirement.',
    lookupPending = false,
    lifecycleMessage,
    lifecyclePending = false,
    onLifecycleAction,
    onLookup,
}: ActionBarProps) {
    const [visibleKey, setVisibleKey] = useState('');
    const [copyMessage, setCopyMessage] = useState<string | null>(null);
    const handleCopyVisibleKey = async () => {
        if (!selectedRequirement) return;
        setCopyMessage(null);
        try {
            await navigator.clipboard.writeText(selectedRequirement.visibleKey);
            setCopyMessage('Key copied.');
        } catch (error) {
            console.error('Copy key failed:', error);
            setCopyMessage('Could not copy the key.');
        }
    };
    const handleLookup = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (visibleKey.trim()) onLookup?.(visibleKey);
    };

    const renderRequirementActions = () => {
        if (!selectedRequirement) {
            return (
                <ActionBarButton
                    type='button'
                    disabled
                    tooltip='Load a requirement before opening history.'>
                    History
                </ActionBarButton>
            );
        }

        return (
            <>
                <ActionBarButton
                    type='button'
                    aria-label={`Open revision history for ${selectedRequirement.visibleKey}`}
                    onClick={() => dispatch({ type: 'setMode', mode: dedicated ? 'historyTab' : 'history' })}>
                    History
                </ActionBarButton>
                {selectedRequirement.status === 'draft' ?
                    <>
                        {dedicated ?
                            <>
                                <ActionBarButton
                                    type='button'
                                    onClick={() => dispatch({ type: 'setMode', mode: 'editRequirementTab' })}>
                                    Edit
                                </ActionBarButton>
                                <ActionBarButton
                                    type='button'
                                    disabled={lifecyclePending}
                                    onClick={() => onLifecycleAction?.('approve', selectedRequirement)}>
                                    Approve
                                </ActionBarButton>
                                <ActionBarButton
                                    type='button'
                                    disabled={lifecyclePending}
                                    onClick={() => onLifecycleAction?.('reject', selectedRequirement)}>
                                    Reject
                                </ActionBarButton>
                            </>
                        :   null}
                        <ActionBarButton
                            type='button'
                            disabled={lifecyclePending}
                            onClick={() => onLifecycleAction?.('delete', selectedRequirement)}>
                            Delete
                        </ActionBarButton>
                    </>
                :   null}
                {selectedRequirement.status === 'approved' ?
                    <>
                        <ActionBarButton
                            type='button'
                            disabled={lifecyclePending}
                            onClick={() => onLifecycleAction?.('markImplemented', selectedRequirement)}>
                            Mark implemented
                        </ActionBarButton>
                        <ActionBarButton
                            type='button'
                            disabled={lifecyclePending}
                            onClick={() => onLifecycleAction?.('markObsolete', selectedRequirement)}>
                            Mark obsolete
                        </ActionBarButton>
                    </>
                :   null}
                {selectedRequirement.status === 'rejected' ?
                    <ActionBarButton
                        type='button'
                        disabled={lifecyclePending}
                        onClick={() => onLifecycleAction?.('markObsolete', selectedRequirement)}>
                        Mark obsolete
                    </ActionBarButton>
                :   null}
                {!dedicated ?
                    <ActionBarButton
                        type='button'
                        onClick={() => void handleCopyVisibleKey()}>
                        Copy key
                    </ActionBarButton>
                :   null}
                <span
                    role='status'
                    aria-live='polite'
                    className='actionbar__feedback'>
                    {copyMessage ?? lifecycleMessage}
                </span>
            </>
        );
    };

    return (
        <div className='workspace-actionbar actionbar'>
            {!dedicated ?
                <>
                    <form
                        className='actionbar__lookup'
                        onSubmit={handleLookup}
                        aria-label='Exact key lookup'>
                        <InputText
                            value={visibleKey}
                            onChange={(event) => setVisibleKey(event.currentTarget.value)}
                            placeholder='FR-KEY-0001'
                            aria-label='Requirement key'
                        />
                        <ActionBarButton
                            type='submit'
                            disabled={!activeProjectId || lookupPending}>
                            Find key
                        </ActionBarButton>
                    </form>
                    <ActionBarButton
                        type='button'
                        disabled={!canCreateRequirement}
                        tooltip={canCreateRequirement ? undefined : createUnavailableReason}
                        onClick={() => dispatch({ type: 'setMode', mode: 'newRequirement' })}>
                        New requirement
                    </ActionBarButton>
                </>
            :   null}
            {renderRequirementActions()}
        </div>
    );
}
