import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    ExpandableNavigationItem,
    type ExpandableNavigationItemProps,
} from '@/components/Navigation/ExpandableNavigationItem';

const defaultSubItems = [
    {
        id: 'requirements',
        label: 'Requirements',
        to: '/projects/project-alpha/requirements',
        iconClassName: 'pi pi-list',
        badgeValue: 4,
    },
    { id: 'categories', label: 'Categories', to: '/projects/project-alpha/categories', iconClassName: 'pi pi-tags' },
] as const;

const defaultProps = {
    label: 'Alpha Project',
    expanded: false,
    active: false,
    subItems: defaultSubItems,
    onToggle: vi.fn(),
} satisfies ExpandableNavigationItemProps;

function renderExpandableNavigationItem(
    props: Partial<ExpandableNavigationItemProps> = {},
    initialEntry = '/',
): ReturnType<typeof render> {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <ul>
                <ExpandableNavigationItem
                    {...defaultProps}
                    {...props}
                />
            </ul>
        </MemoryRouter>,
    );
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ExpandableNavigationItem', () => {
    describe('renders', () => {
        it('the item label.', () => {
            renderExpandableNavigationItem();

            expect(screen.getByRole('button', { name: /alpha project/i })).toBeInTheDocument();
        });

        it('the optional parent badge value.', () => {
            renderExpandableNavigationItem({ badgeValue: 8 });

            expect(screen.getByText('8')).toBeInTheDocument();
        });

        it('the collapsed state as aria-expanded=false.', () => {
            renderExpandableNavigationItem({ expanded: false });

            expect(screen.getByRole('button', { name: /alpha project/i })).toHaveAttribute('aria-expanded', 'false');
        });

        it('the expanded state as aria-expanded=true.', () => {
            renderExpandableNavigationItem({ expanded: true });

            expect(screen.getByRole('button', { name: /alpha project/i })).toHaveAttribute('aria-expanded', 'true');
        });

        it('expanded sub item links with their destination href values.', () => {
            renderExpandableNavigationItem({ expanded: true });

            expect(screen.getByRole('link', { name: /requirements/i })).toHaveAttribute(
                'href',
                '/projects/project-alpha/requirements',
            );
            expect(screen.getByRole('link', { name: /categories/i })).toHaveAttribute(
                'href',
                '/projects/project-alpha/categories',
            );
        });

        it('a sub item badge value.', () => {
            renderExpandableNavigationItem({ expanded: true, badgeValue: undefined });

            expect(screen.getByRole('link', { name: /requirements/i })).toHaveTextContent('4');
        });

        it('no accessible sub items when the item is collapsed.', () => {
            renderExpandableNavigationItem({ expanded: false });

            expect(screen.queryByRole('link', { name: /requirements/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('link', { name: /categories/i })).not.toBeInTheDocument();
        });
    });

    describe('marks / does not mark', () => {
        it('an active parent item with aria-current.', () => {
            renderExpandableNavigationItem({ active: true });

            expect(screen.getByRole('button', { name: /alpha project/i })).toHaveAttribute('aria-current', 'page');
        });

        it('a non-active parent item without aria-current.', () => {
            renderExpandableNavigationItem({ active: false });

            expect(screen.getByRole('button', { name: /alpha project/i })).not.toHaveAttribute('aria-current');
        });

        it('the active sub item based on the current route.', () => {
            renderExpandableNavigationItem({ expanded: true }, '/projects/project-alpha/categories');

            expect(screen.getByRole('link', { name: /categories/i })).toHaveAttribute('aria-current', 'page');
            expect(screen.getByRole('link', { name: /requirements/i })).not.toHaveAttribute('aria-current');
        });
    });

    describe('calls', () => {
        it('onToggle when the item button is clicked.', async () => {
            const user = userEvent.setup();
            const onToggle = vi.fn();

            renderExpandableNavigationItem({ onToggle });

            await user.click(screen.getByRole('button', { name: /alpha project/i }));

            expect(onToggle).toHaveBeenCalledTimes(1);
        });

        it('onContextMenu when the item button is right-clicked.', () => {
            const onContextMenu = vi.fn();

            renderExpandableNavigationItem({ onContextMenu });

            fireEvent.contextMenu(screen.getByRole('button', { name: /alpha project/i }));

            expect(onContextMenu).toHaveBeenCalledTimes(1);
        });

        it('onSubItemClick when a sub item is clicked.', async () => {
            const user = userEvent.setup();
            const onSubItemClick = vi.fn();

            renderExpandableNavigationItem({ expanded: true, onSubItemClick });

            await user.click(screen.getByRole('link', { name: /categories/i }));

            expect(onSubItemClick).toHaveBeenCalledTimes(1);
        });
    });
});
