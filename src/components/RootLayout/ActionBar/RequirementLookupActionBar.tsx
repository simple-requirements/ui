import { useSelector } from '@tanstack/react-store';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import type { ComponentProps, ReactNode } from 'react';

import { ActionBar } from '@/components/RootLayout/ActionBar/ActionBar';
import { actionBarStore, setRequirementKey } from '@/stores/actionBarStore';

export type RequirementLookupActionBarProps = Readonly<{
    disabled?: boolean;
    children?: ReactNode;
    onFindKey?: (requirementKey: string) => void;
}>;

export function RequirementLookupActionBar({ disabled = false, children, onFindKey }: RequirementLookupActionBarProps) {
    const requirementKey = useSelector(actionBarStore, (state) => state.requirementKey);

    const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (event) => {
        event.preventDefault();

        const trimmedKey = requirementKey.trim();
        if (trimmedKey.length > 0) onFindKey?.(trimmedKey);
    };

    return (
        <ActionBar label='Requirement actions'>
            <form
                className='action-bar__lookup'
                aria-label='Requirement key lookup'
                onSubmit={handleSubmit}>
                <InputText
                    id='requirement-key'
                    value={requirementKey}
                    disabled={disabled}
                    onChange={(event) => setRequirementKey(event.currentTarget.value)}
                    placeholder='FR-KEY-0001'
                    aria-label='Requirement key'
                    pt={{ root: { className: 'action-bar__input' } }}
                />

                <Button
                    outlined
                    type='submit'
                    label='Find requirement'
                    disabled={disabled}
                    pt={{ root: { className: 'action-bar__button' } }}
                />
            </form>

            {children}
        </ActionBar>
    );
}
