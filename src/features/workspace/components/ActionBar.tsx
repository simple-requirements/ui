import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState, type SyntheticEvent } from 'react';
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
    lookupMessage?: string | null;
    lookupPending?: boolean;
    lifecycleMessage?: string | null;
    lifecyclePending?: boolean;
    onLifecycleAction?: (command: RequirementLifecycleCommand, requirement: RequirementView) => void;
    onLookup?: (visibleKey: string) => void;
}>;

/** Renders context actions for the selected current requirement without exposing actions for historical snapshots. */
export function ActionBar({
    activeProjectId,
    selectedRequirement,
    dedicated = false,
    dispatch,
    canCreateRequirement = false,
    createUnavailableReason = 'Select a loaded project and load categories before creating a requirement.',
    lookupMessage,
    lookupPending = false,
    lifecycleMessage,
    lifecyclePending = false,
    onLifecycleAction,
    onLookup,
}: ActionBarProps) {
    const [visibleKey, setVisibleKey] = useState('');
    const [copyMessage, setCopyMessage] = useState<string | null>(null);
    const handleOpenInTab = () => {
        if (!selectedRequirement) return;
        dispatch({
            type: 'openRequirementTab',
            requirementId: selectedRequirement.id,
            visibleKey: selectedRequirement.visibleKey,
        });
    };
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
                <>
                    <Button
                        type='button'
                        disabled
                        tooltip='Load a requirement before opening history.'>
                        History
                    </Button>
                    <span className='sr-only'>Load a requirement before opening history.</span>
                </>
            );
        }

        return (
            <>
                <Button
                    type='button'
                    aria-label={`Open revision history for ${selectedRequirement.visibleKey}`}
                    onClick={() => dispatch({ type: 'setMode', mode: dedicated ? 'historyTab' : 'history' })}>
                    History
                </Button>
                {selectedRequirement.status === 'draft' ?
                    <>
                        <Button
                            type='button'
                            onClick={() =>
                                dispatch({
                                    type: 'setMode',
                                    mode: dedicated ? 'editRequirementTab' : 'editRequirement',
                                })
                            }>
                            Edit
                        </Button>
                        <Button
                            type='button'
                            disabled={lifecyclePending}
                            onClick={() => onLifecycleAction?.('approve', selectedRequirement)}>
                            Approve
                        </Button>
                        <Button
                            type='button'
                            disabled={lifecyclePending}
                            onClick={() => onLifecycleAction?.('reject', selectedRequirement)}>
                            Reject
                        </Button>
                        <Button
                            type='button'
                            severity='danger'
                            disabled={lifecyclePending}
                            onClick={() => onLifecycleAction?.('delete', selectedRequirement)}>
                            Delete
                        </Button>
                    </>
                :   null}
                {selectedRequirement.status === 'approved' ?
                    <>
                        <Button
                            type='button'
                            disabled={lifecyclePending}
                            onClick={() => onLifecycleAction?.('markImplemented', selectedRequirement)}>
                            Mark implemented
                        </Button>
                        <Button
                            type='button'
                            disabled={lifecyclePending}
                            onClick={() => onLifecycleAction?.('markObsolete', selectedRequirement)}>
                            Mark obsolete
                        </Button>
                    </>
                :   null}
                {selectedRequirement.status === 'rejected' ?
                    <Button
                        type='button'
                        disabled={lifecyclePending}
                        onClick={() => onLifecycleAction?.('markObsolete', selectedRequirement)}>
                        Mark obsolete
                    </Button>
                :   null}
                {!dedicated ?
                    <Button
                        type='button'
                        onClick={handleOpenInTab}>
                        Open in tab
                    </Button>
                :   null}
                <Button
                    type='button'
                    onClick={() => void handleCopyVisibleKey()}>
                    Copy key
                </Button>
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
                        <Button
                            type='submit'
                            disabled={!activeProjectId || lookupPending}>
                            Find key
                        </Button>
                        <span role='status'>{lookupMessage}</span>
                    </form>
                    <Button
                        type='button'
                        disabled={!canCreateRequirement}
                        tooltip={canCreateRequirement ? undefined : createUnavailableReason}
                        aria-describedby='new-requirement-unavailable'
                        onClick={() => dispatch({ type: 'setMode', mode: 'newRequirement' })}>
                        New requirement
                    </Button>
                    <span
                        id='new-requirement-unavailable'
                        className='sr-only'>
                        {createUnavailableReason}
                    </span>
                </>
            :   null}
            {renderRequirementActions()}
        </div>
    );
}
