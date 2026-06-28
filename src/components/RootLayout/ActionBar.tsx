import { useSelector } from '@tanstack/react-store';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import type { ComponentProps } from 'react';

import { actionBarStore, setRequirementKey } from '@/stores/actionBarStore';

import '@/components/RootLayout/ActionBar.scss';

type ActionBarProps = Readonly<{ onCopyKey?: () => void; onFindKey?: (requirementKey: string) => void }>;

export function ActionBar({ onCopyKey, onFindKey }: ActionBarProps) {
    const requirementKey = useSelector(actionBarStore, (state) => state.requirementKey);

    const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (event) => {
        event.preventDefault();

        const trimmedKey = requirementKey.trim();
        if (trimmedKey.length > 0) onFindKey?.(trimmedKey);
    };

    return (
        <section
            className='action-bar'
            aria-label='Requirement actions'>
            <form
                className='action-bar__lookup'
                aria-label='Requirement key lookup'
                onSubmit={handleSubmit}>
                <InputText
                    id='requirement-key'
                    value={requirementKey}
                    onChange={(event) => setRequirementKey(event.currentTarget.value)}
                    placeholder='FR-KEY-0001'
                    aria-label='Requirement key'
                    pt={{ root: { className: 'action-bar__input' } }}
                />

                <Button
                    outlined
                    type='submit'
                    label='Find key'
                    pt={{ root: { className: 'action-bar__button' } }}
                />
            </form>

            <Button
                outlined
                type='button'
                label='Copy key'
                onClick={onCopyKey}
                pt={{ root: { className: 'action-bar__button' } }}
            />
        </section>
    );
}
