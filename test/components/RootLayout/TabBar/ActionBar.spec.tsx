import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ActionBar, RequirementKeyLookup } from '@/components/RootLayout/ActionBar/ActionBar';
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

function setMockReviewActionRequirement(status: 'draft' | 'approved' = 'draft'): void {
    actionBarStore.setState((state) => ({
        ...state,
        reviewActionRequirement: {
            projectId: 'project-alpha',
            requirementId: 'requirement-alpha',
            visibleKey: 'FR-AUTH-0001',
            status,
        },
    }));
}

function LocationProbe() {
    const location = useLocation();

    return <output aria-label='Current route'>{location.pathname}</output>;
}

function renderActionBar(initialRoute = '/'): ReturnType<typeof render> {
    const element = (
        <>
            <ActionBar />
            <LocationProbe />
        </>
    );
    const router = createMemoryRouter(
        [
            { path: '/', element, handle: { actionBar: 'requirements' } },
            { path: '/projects/:projectId/requirements', element, handle: { actionBar: 'requirements' } },
            {
                path: '/projects/:projectId/requirements/new',
                element,
                handle: { actionBar: 'requirementForm', disableChromeActions: true },
            },
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
    actionBarStore.setState({ requirementKey: '' });
    mocks.setRequirementKey.mockClear();
});

afterEach(() => {
    cleanup();
    actionBarStore.setState({ requirementKey: '' });
    vi.clearAllMocks();
});

describe('ActionBar', () => {
    describe('renders', () => {
        it('renders the requirement key input and Find requirement button on requirement list routes.', () => {
            renderActionBar('/projects/project-alpha/requirements');

            expect(screen.getByRole('textbox', { name: /requirement key/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /find requirement/i })).toBeInTheDocument();
        });

        it('renders the requirement key from the store on requirement list routes.', () => {
            setMockRequirementKey('NFR-USAB-0043');

            renderActionBar('/projects/project-alpha/requirements');

            expect(screen.getByRole('textbox', { name: /requirement key/i })).toHaveValue('NFR-USAB-0043');
        });

        it('renders a Create button on requirement routes.', () => {
            renderActionBar('/projects/project-alpha/requirements');

            expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
        });

        it('renders Create directly after the requirement lookup actions on requirement list routes.', () => {
            renderActionBar('/projects/project-alpha/requirements');

            const findButton = screen.getByRole('button', { name: /find requirement/i });
            const createButton = screen.getByRole('button', { name: 'Create' });

            expect(findButton.compareDocumentPosition(createButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        });

        it('shows a no-op Start review button for a selected draft requirement.', async () => {
            const user = userEvent.setup();
            setMockReviewActionRequirement('draft');

            renderActionBar('/projects/project-alpha/requirements');

            await user.click(screen.getByRole('button', { name: 'Start review' }));

            expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-alpha/requirements');
        });

        it('does not show the Start review button for a selected non-draft requirement.', () => {
            setMockReviewActionRequirement('approved');

            renderActionBar('/projects/project-alpha/requirements');

            expect(screen.queryByRole('button', { name: 'Start review' })).not.toBeInTheDocument();
        });

        it('renders a Create button on category routes.', () => {
            renderActionBar('/projects/project-alpha/categories');

            expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
        });

        it('hides requirement lookup on category routes.', () => {
            renderActionBar('/projects/project-alpha/categories');

            expect(screen.queryByRole('textbox', { name: /requirement key/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /find requirement/i })).not.toBeInTheDocument();
        });

        it('hides requirement lookup and disables Create on requirement form routes.', () => {
            renderActionBar('/projects/project-alpha/requirements/new');

            expect(screen.queryByRole('textbox', { name: /requirement key/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /find requirement/i })).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
        });

        it('hides requirement lookup and disables Create on category form routes.', () => {
            renderActionBar('/projects/project-alpha/categories/new');

            expect(screen.queryByRole('textbox', { name: /requirement key/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /find requirement/i })).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
        });
    });

    it('navigates to the requirement create route when Create is clicked on requirement routes.', async () => {
        const user = userEvent.setup();

        renderActionBar('/projects/project-alpha/requirements');

        await user.click(screen.getByRole('button', { name: 'Create' }));

        expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-alpha/requirements/new');
    });

    it('navigates to the category create route when Create is clicked.', async () => {
        const user = userEvent.setup();

        renderActionBar('/projects/project-alpha/categories');

        await user.click(screen.getByRole('button', { name: 'Create' }));

        expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-alpha/categories/new');
    });
});

describe('RequirementKeyLookup', () => {
    it('calls onFindKey with the trimmed requirement key when Find requirement is clicked.', async () => {
        const user = userEvent.setup();
        const onFindKey = vi.fn();

        setMockRequirementKey('  NFR-USAB-0043  ');

        render(<RequirementKeyLookup onFindKey={onFindKey} />);

        await user.click(screen.getByRole('button', { name: /find requirement/i }));

        expect(onFindKey).toHaveBeenCalledTimes(1);
        expect(onFindKey).toHaveBeenCalledWith('NFR-USAB-0043');
    });

    it('calls onFindKey with the trimmed requirement key when Enter is pressed.', async () => {
        const user = userEvent.setup();
        const onFindKey = vi.fn();

        setMockRequirementKey('  FR-KEY-0001  ');

        render(<RequirementKeyLookup onFindKey={onFindKey} />);

        await user.click(screen.getByRole('textbox', { name: /requirement key/i }));
        await user.keyboard('{Enter}');

        expect(onFindKey).toHaveBeenCalledTimes(1);
        expect(onFindKey).toHaveBeenCalledWith('FR-KEY-0001');
    });

    it('does not call onFindKey when the input is empty.', async () => {
        const user = userEvent.setup();
        const onFindKey = vi.fn();

        render(<RequirementKeyLookup onFindKey={onFindKey} />);

        await user.click(screen.getByRole('button', { name: /find requirement/i }));

        expect(onFindKey).not.toHaveBeenCalled();
    });

    it('does not call onFindKey when the input contains only whitespace.', async () => {
        const user = userEvent.setup();
        const onFindKey = vi.fn();

        setMockRequirementKey('   ');

        render(<RequirementKeyLookup onFindKey={onFindKey} />);

        await user.click(screen.getByRole('button', { name: /find requirement/i }));

        expect(onFindKey).not.toHaveBeenCalled();
    });

    it('passes changed input values to the action bar store.', () => {
        render(<RequirementKeyLookup />);

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

        render(<RequirementKeyLookup />);

        await user.click(screen.getByRole('button', { name: /find requirement/i }));

        expect(screen.getByRole('textbox', { name: /requirement key/i })).toHaveValue('NFR-USAB-0043');
    });
});
