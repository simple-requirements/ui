import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState, type SyntheticEvent } from 'react';
import type { Action } from '@/state/workspaceReducer';
import type { RequirementView } from '@/types/domain';

type ActionBarProps = Readonly<{
    activeProjectId: string | null;
    selectedRequirement: RequirementView | null;
    dedicated?: boolean;
    dispatch: (action: Action) => void;
    lookupMessage?: string | null;
    lookupPending?: boolean;
    onLookup?: (visibleKey: string) => void;
}>;

export function ActionBar({
    activeProjectId,
    selectedRequirement,
    dedicated = false,
    dispatch,
    lookupMessage,
    lookupPending = false,
    onLookup,
}: ActionBarProps) {
    const [visibleKey, setVisibleKey] = useState('');
    const handleOpenInTab = () =>
        selectedRequirement
        && dispatch({
            type: 'openRequirementTab',
            requirementId: selectedRequirement.id,
            visibleKey: selectedRequirement.visibleKey,
        });
    const handleCopyVisibleKey = () =>
        selectedRequirement && void navigator.clipboard.writeText(selectedRequirement.visibleKey);
    const handleLookup = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (visibleKey.trim()) onLookup?.(visibleKey);
    };
    return (
        <div className='workspace-actionbar actionbar'>
            {!dedicated ?
                <form
                    onSubmit={handleLookup}
                    aria-label='Exact visible-key lookup'>
                    <InputText
                        value={visibleKey}
                        onChange={(event) => setVisibleKey(event.currentTarget.value)}
                        placeholder='FR-KEY-0001'
                        aria-label='Visible key'
                    />
                    <Button
                        type='submit'
                        disabled={!activeProjectId || lookupPending}>
                        Find key
                    </Button>
                    <span role='status'>{lookupMessage}</span>
                </form>
            :   null}
            {!dedicated ?
                <Button
                    type='button'
                    disabled
                    tooltip='Requirement creation is not implemented in this package.'
                    aria-describedby='new-requirement-unavailable'>
                    New requirement
                </Button>
            :   null}
            {!dedicated ?
                <span
                    id='new-requirement-unavailable'
                    className='sr-only'>
                    Requirement creation is not implemented in this package.
                </span>
            :   null}
            {selectedRequirement && !dedicated ?
                <Button
                    type='button'
                    onClick={handleOpenInTab}>
                    Open in tab
                </Button>
            :   null}
            {selectedRequirement ?
                <Button
                    type='button'
                    onClick={handleCopyVisibleKey}>
                    Copy visible key
                </Button>
            :   null}
        </div>
    );
}
