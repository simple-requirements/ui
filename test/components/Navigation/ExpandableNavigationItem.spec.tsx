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
    },
    { id: 'categories', label: 'Categories', to: '/projects/project-alpha/categories', iconClassName: 'pi pi-tags' },
] as const;

const defaultProps = {
    label: 'Alpha Project',
    badgeValue: 4,
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
        it('the item label and badge value.', () => {
            renderExpandableNavigationItem();

            expect(screen.getByRole('button', { name: /alpha project/i })).toBeInTheDocument();
            expect(screen.getByText('4')).toBeInTheDocument();
        });

        it('the collapsed icon when the item is collapsed.', () => {
            renderExpandableNavigationItem({ expanded: false });

            const button = screen.getByRole('button', { name: /alpha project/i });
            const icon = button.querySelector('.expandable-navigation-item__icon');

            expect(button).toHaveAttribute('aria-expanded', 'false');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('pi-folder');
            expect(icon).not.toHaveClass('pi-folder-open');
        });

        it('the expanded icon when the item is expanded.', () => {
            renderExpandableNavigationItem({ expanded: true });

            const button = screen.getByRole('button', { name: /alpha project/i });
            const icon = button.querySelector('.expandable-navigation-item__icon');

            expect(button).toHaveAttribute('aria-expanded', 'true');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('pi-folder-open');
            expect(icon).not.toHaveClass('pi-folder');
        });

        it('the sub items when the item is expanded.', () => {
            renderExpandableNavigationItem({ expanded: true });

            expect(screen.getByRole('link', { name: /requirements/i })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /categories/i })).toBeInTheDocument();
        });

        it('no accessible sub items when the item is collapsed.', () => {
            renderExpandableNavigationItem({ expanded: false });

            expect(screen.queryByRole('link', { name: /requirements/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('link', { name: /categories/i })).not.toBeInTheDocument();
        });
    });

    describe('marks / does not mark', () => {
        it('an active item with aria-current and the active class.', () => {
            renderExpandableNavigationItem({ active: true });

            const button = screen.getByRole('button', { name: /alpha project/i });

            expect(button).toHaveAttribute('aria-current', 'page');
            expect(button).toHaveClass('expandable-navigation-item__button--active');
        });

        it('a non-active item without aria-current and without the active class.', () => {
            renderExpandableNavigationItem({ active: false });

            const button = screen.getByRole('button', { name: /alpha project/i });

            expect(button).not.toHaveAttribute('aria-current');
            expect(button).not.toHaveClass('expandable-navigation-item__button--active');
        });

        it('the active sub item based on the current route.', () => {
            renderExpandableNavigationItem({ expanded: true }, '/projects/project-alpha/categories');

            expect(screen.getByRole('link', { name: /categories/i })).toHaveClass(
                'expandable-navigation-item__sub-link--active',
            );
            expect(screen.getByRole('link', { name: /requirements/i })).not.toHaveClass(
                'expandable-navigation-item__sub-link--active',
            );
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
