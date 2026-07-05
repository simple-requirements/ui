import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ActionBarOutlet } from '@/components/RootLayout/ActionBar/ActionBarOutlet';
import { RequirementLookupActionBar } from '@/components/RootLayout/ActionBar/RequirementLookupActionBar';
import type * as ActionBarStoreModule from '@/stores/actionBarStore';
import { actionBarStore } from '@/stores/actionBarStore';

const mocks = vi.hoisted(() => ({ setRequirementKey: vi.fn() }));

vi.mock('@/stores/actionBarStore', async (importOriginal) => {
    const actual = await importOriginal<typeof ActionBarStoreModule>();

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

function LocationProbe() {
    const location = useLocation();

    return <output aria-label='Current route'>{location.pathname}</output>;
}

function renderActionBarOutlet(initialRoute = '/'): ReturnType<typeof render> {
    const element = (
        <>
            <ActionBarOutlet />
            <LocationProbe />
        </>
    );
    const router = createMemoryRouter(
        [
            { path: '/', element, handle: { actionBar: 'requirements' } },
            { path: '/projects/:projectId/categories', element, handle: { actionBar: 'categories' } },
            {
                path: '/projects/:projectId/categories/new',
                element,
                handle: { actionBar: 'categoryForm', disableChromeActions: true },
            },
        ],
        { initialEntries: [initialRoute] },
    );

    return render(<RouterProvider router={router} />);
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

describe('ActionBarOutlet', () => {
    describe('renders', () => {
        it('renders the requirement key input and Find requirement button.', () => {
            renderActionBarOutlet();

            expect(screen.getByRole('textbox', { name: /requirement key/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /find requirement/i })).toBeInTheDocument();
        });

        it('renders the requirement key from the store.', () => {
            setMockRequirementKey('NFR-USAB-0043');

            renderActionBarOutlet();

            expect(screen.getByRole('textbox', { name: /requirement key/i })).toHaveValue('NFR-USAB-0043');
        });

        it('renders a Create button on category routes.', () => {
            renderActionBarOutlet('/projects/project-alpha/categories');

            expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
        });

        it('disables action buttons on category form routes.', () => {
            renderActionBarOutlet('/projects/project-alpha/categories/new');

            expect(screen.getByRole('textbox', { name: /requirement key/i })).toBeDisabled();
            expect(screen.getByRole('button', { name: /find requirement/i })).toBeDisabled();
            expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
        });
    });

    it('navigates to the category create route when Create is clicked.', async () => {
        const user = userEvent.setup();

        renderActionBarOutlet('/projects/project-alpha/categories');

        await user.click(screen.getByRole('button', { name: 'Create' }));

        expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-alpha/categories/new');
    });
});

describe('RequirementLookupActionBar', () => {
    it('calls onFindKey with the trimmed requirement key when Find requirement is clicked.', async () => {
        const user = userEvent.setup();
        const onFindKey = vi.fn();

        setMockRequirementKey('  NFR-USAB-0043  ');

        render(<RequirementLookupActionBar onFindKey={onFindKey} />);

        await user.click(screen.getByRole('button', { name: /find requirement/i }));

        expect(onFindKey).toHaveBeenCalledTimes(1);
        expect(onFindKey).toHaveBeenCalledWith('NFR-USAB-0043');
    });

    it('calls onFindKey with the trimmed requirement key when Enter is pressed.', async () => {
        const user = userEvent.setup();
        const onFindKey = vi.fn();

        setMockRequirementKey('  FR-KEY-0001  ');

        render(<RequirementLookupActionBar onFindKey={onFindKey} />);

        await user.click(screen.getByRole('textbox', { name: /requirement key/i }));
        await user.keyboard('{Enter}');

        expect(onFindKey).toHaveBeenCalledTimes(1);
        expect(onFindKey).toHaveBeenCalledWith('FR-KEY-0001');
    });

    it('does not call onFindKey when the input is empty.', async () => {
        const user = userEvent.setup();
        const onFindKey = vi.fn();

        render(<RequirementLookupActionBar onFindKey={onFindKey} />);

        await user.click(screen.getByRole('button', { name: /find requirement/i }));

        expect(onFindKey).not.toHaveBeenCalled();
    });

    it('does not call onFindKey when the input contains only whitespace.', async () => {
        const user = userEvent.setup();
        const onFindKey = vi.fn();

        setMockRequirementKey('   ');

        render(<RequirementLookupActionBar onFindKey={onFindKey} />);

        await user.click(screen.getByRole('button', { name: /find requirement/i }));

        expect(onFindKey).not.toHaveBeenCalled();
    });

    it('passes changed input values to the action bar store.', () => {
        render(<RequirementLookupActionBar />);

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

        render(<RequirementLookupActionBar />);

        await user.click(screen.getByRole('button', { name: /find requirement/i }));

        expect(screen.getByRole('textbox', { name: /requirement key/i })).toHaveValue('NFR-USAB-0043');
    });
});
