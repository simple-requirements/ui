import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ActionBar } from '@/components/RootLayout/ActionBar';
import { actionBarStore } from '@/stores/actionBarStore';

const mocks = vi.hoisted(() => ({ setRequirementKey: vi.fn() }));

vi.mock('@/stores/actionBarStore', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('@/stores/actionBarStore')>();

    return {
        ...actual,
        setRequirementKey: (requirementKey: string): void => {
            mocks.setRequirementKey(requirementKey);
            actual.setRequirementKey(requirementKey);
        },
    };
});

function setMockRequirementKey(requirementKey: string): void {
    actionBarStore.setState((state) => ({ ...state, requirementKey }));
}

beforeEach(() => {
    setMockRequirementKey('');
    mocks.setRequirementKey.mockClear();
});

afterEach(() => {
    cleanup();
    setMockRequirementKey('');
    vi.clearAllMocks();
});

describe('ActionBar', () => {
    describe('renders', () => {
        it('renders the requirement key input and action buttons.', () => {
            render(<ActionBar />);

            expect(screen.getByRole('textbox', { name: /requirement key/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /find key/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /copy key/i })).toBeInTheDocument();
        });

        it('renders the requirement key from the store.', () => {
            setMockRequirementKey('NFR-USAB-0043');

            render(<ActionBar />);

            expect(screen.getByRole('textbox', { name: /requirement key/i })).toHaveValue('NFR-USAB-0043');
        });
    });

    describe('calls', () => {
        it('onFindKey with the trimmed requirement key when Find key is clicked.', async () => {
            const user = userEvent.setup();
            const onFindKey = vi.fn();

            setMockRequirementKey('  NFR-USAB-0043  ');

            render(<ActionBar onFindKey={onFindKey} />);

            await user.click(screen.getByRole('button', { name: /find key/i }));

            expect(onFindKey).toHaveBeenCalledTimes(1);
            expect(onFindKey).toHaveBeenCalledWith('NFR-USAB-0043');
        });

        it('onFindKey with the trimmed requirement key when Enter is pressed.', async () => {
            const user = userEvent.setup();
            const onFindKey = vi.fn();

            setMockRequirementKey('  FR-KEY-0001  ');

            render(<ActionBar onFindKey={onFindKey} />);

            await user.click(screen.getByRole('textbox', { name: /requirement key/i }));
            await user.keyboard('{Enter}');

            expect(onFindKey).toHaveBeenCalledTimes(1);
            expect(onFindKey).toHaveBeenCalledWith('FR-KEY-0001');
        });

        it('does not call onFindKey when the input is empty.', async () => {
            const user = userEvent.setup();
            const onFindKey = vi.fn();

            render(<ActionBar onFindKey={onFindKey} />);

            await user.click(screen.getByRole('button', { name: /find key/i }));

            expect(onFindKey).not.toHaveBeenCalled();
        });

        it('does not call onFindKey when the input contains only whitespace.', async () => {
            const user = userEvent.setup();
            const onFindKey = vi.fn();

            setMockRequirementKey('   ');

            render(<ActionBar onFindKey={onFindKey} />);

            await user.click(screen.getByRole('button', { name: /find key/i }));

            expect(onFindKey).not.toHaveBeenCalled();
        });

        it('onCopyKey when Copy key is clicked.', async () => {
            const user = userEvent.setup();
            const onCopyKey = vi.fn();

            render(<ActionBar onCopyKey={onCopyKey} />);

            await user.click(screen.getByRole('button', { name: /copy key/i }));

            expect(onCopyKey).toHaveBeenCalledTimes(1);
        });
    });
    it('passes changed input values to the action bar store.', () => {
        render(<ActionBar />);

        fireEvent.change(screen.getByRole('textbox', { name: /requirement key/i }), {
            target: { value: 'NFR-USAB-0043' },
        });

        expect(mocks.setRequirementKey).toHaveBeenCalledTimes(1);
        expect(mocks.setRequirementKey).toHaveBeenCalledWith('NFR-USAB-0043');
        expect(screen.getByRole('textbox', { name: /requirement key/i })).toHaveValue('NFR-USAB-0043');
    });

    it('can be used without callbacks.', async () => {
        const user = userEvent.setup();

        setMockRequirementKey('NFR-USAB-0043');

        render(<ActionBar />);

        await user.click(screen.getByRole('button', { name: /find key/i }));
        await user.click(screen.getByRole('button', { name: /copy key/i }));

        expect(screen.getByRole('textbox', { name: /requirement key/i })).toHaveValue('NFR-USAB-0043');
    });
});
