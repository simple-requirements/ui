import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Sidebar } from '@/components/RootLayout/Sidebar/Sidebar';

type TestProject = Readonly<{
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    requirementCount: number;
}>;

type UseLiveQueryResult = Readonly<{ data: readonly TestProject[] }>;

const mocks = vi.hoisted(() => ({ useLiveQuery: vi.fn(), contextMenuShow: vi.fn() }));

vi.mock('@tanstack/react-db', () => ({ useLiveQuery: mocks.useLiveQuery }));

vi.mock('@/api/collections/projectsCollection', () => ({ projectsCollection: {} }));

vi.mock('@/components/RootLayout/Sidebar/SidebarContextMenu', () => ({
    SidebarContextMenu: ({ contextMenuRef }: { contextMenuRef: unknown }) => {
        (contextMenuRef as { current: { show: (event: unknown) => void } | null }).current = {
            show: mocks.contextMenuShow,
        };

        return <div data-testid='sidebar-context-menu' />;
    },
}));

function createTestQueryClient(): QueryClient {
    return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function renderSidebar(initialEntry = '/'): ReturnType<typeof render> {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <QueryClientProvider client={createTestQueryClient()}>
                <Sidebar />
            </QueryClientProvider>
        </MemoryRouter>,
    );
}

function createProject(overrides: Partial<TestProject>): TestProject {
    return {
        id: 'project-id',
        name: 'Project',
        createdAt: '2026-06-28T10:00:00.000Z',
        updatedAt: '2026-06-28T10:00:00.000Z',
        requirementCount: 0,
        ...overrides,
    };
}

function mockUseLiveQuery(result: Partial<UseLiveQueryResult>): void {
    mocks.useLiveQuery.mockReturnValue({ data: [], ...result });
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('Sidebar', () => {
    describe('renders', () => {
        it('the sidebar landmarks.', () => {
            mockUseLiveQuery({ data: [] });

            renderSidebar();

            expect(screen.getByRole('complementary', { name: /projects/i })).toBeInTheDocument();
            expect(screen.getByRole('group', { name: /project actions/i })).toBeInTheDocument();
            expect(screen.getByRole('navigation', { name: /project list/i })).toBeInTheDocument();
        });

        it('the sidebar context menu component.', () => {
            mockUseLiveQuery({ data: [] });

            renderSidebar();

            expect(screen.getByTestId('sidebar-context-menu')).toBeInTheDocument();
        });

        it('the empty state when there are no projects.', () => {
            mockUseLiveQuery({ data: [] });

            renderSidebar();

            expect(screen.getByText('No projects available.')).toBeInTheDocument();
        });

        it('projects from the collection.', () => {
            mockUseLiveQuery({
                data: [
                    createProject({ id: 'project-alpha', name: 'Alpha Project', requirementCount: 4 }),
                    createProject({ id: 'project-beta', name: 'Beta Project', requirementCount: 7 }),
                ],
            });

            renderSidebar();

            expect(screen.getByRole('button', { name: /alpha project/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /beta project/i })).toBeInTheDocument();
            expect(screen.getByText('4')).toBeInTheDocument();
            expect(screen.getByText('7')).toBeInTheDocument();
        });

        it('projects sorted by name.', () => {
            mockUseLiveQuery({
                data: [
                    createProject({ id: 'project-zeta', name: 'Zeta Project', requirementCount: 2 }),
                    createProject({ id: 'project-alpha', name: 'Alpha Project', requirementCount: 4 }),
                    createProject({ id: 'project-beta', name: 'Beta Project', requirementCount: 7 }),
                ],
            });

            renderSidebar();

            const navigation = screen.getByRole('navigation', { name: /project list/i });
            const projectButtons = within(navigation).getAllByRole('button');

            const projectNames = projectButtons.map(
                (button) => button.querySelector('.expandable-navigation-item__label')?.textContent.trim() ?? '',
            );

            expect(projectNames).toEqual(['Alpha Project', 'Beta Project', 'Zeta Project']);
        });

        it.for([
            { testName: 'New project', buttonName: /new project/i },
            { testName: 'Synchronize projects', buttonName: /synchronize projects/i },
        ])('the $testName action.', ({ buttonName }) => {
            mockUseLiveQuery({ data: [] });

            renderSidebar();

            expect(screen.getByRole('button', { name: buttonName })).toBeInTheDocument();
        });
    });

    describe('opens / collapses', () => {
        it('a project and activates the requirements sub item when the project is clicked.', async () => {
            const user = userEvent.setup();

            mockUseLiveQuery({
                data: [
                    createProject({ id: 'project-alpha', name: 'Alpha Project', requirementCount: 4 }),
                    createProject({ id: 'project-beta', name: 'Beta Project', requirementCount: 7 }),
                ],
            });

            renderSidebar();

            const alphaButton = screen.getByRole('button', { name: /alpha project/i });

            await user.click(alphaButton);

            expect(alphaButton).toHaveAttribute('aria-expanded', 'true');
            expect(alphaButton).not.toHaveAttribute('aria-current');

            expect(screen.getByRole('link', { name: /requirements/i })).toHaveClass(
                'expandable-navigation-item__sub-link--active',
            );
            expect(screen.getByRole('link', { name: /categories/i })).not.toHaveClass(
                'expandable-navigation-item__sub-link--active',
            );
        });

        it('the categories route when the categories sub item is clicked.', async () => {
            const user = userEvent.setup();

            mockUseLiveQuery({
                data: [createProject({ id: 'project-alpha', name: 'Alpha Project', requirementCount: 4 })],
            });

            renderSidebar();

            await user.click(screen.getByRole('button', { name: /alpha project/i }));
            await user.click(screen.getByRole('link', { name: /categories/i }));

            expect(screen.getByRole('button', { name: /alpha project/i })).toHaveAttribute('aria-expanded', 'true');
            expect(screen.getByRole('link', { name: /categories/i })).toHaveClass(
                'expandable-navigation-item__sub-link--active',
            );
            expect(screen.getByRole('link', { name: /requirements/i })).not.toHaveClass(
                'expandable-navigation-item__sub-link--active',
            );
        });

        it('a project and marks the project itself as active when the project is clicked again.', async () => {
            const user = userEvent.setup();

            mockUseLiveQuery({
                data: [createProject({ id: 'project-alpha', name: 'Alpha Project', requirementCount: 4 })],
            });

            renderSidebar();

            const alphaButton = screen.getByRole('button', { name: /alpha project/i });

            await user.click(alphaButton);
            await user.click(alphaButton);

            expect(alphaButton).toHaveAttribute('aria-expanded', 'false');
            expect(alphaButton).toHaveAttribute('aria-current', 'page');
            expect(alphaButton).toHaveClass('expandable-navigation-item__button--active');

            expect(screen.queryByRole('link', { name: /requirements/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('link', { name: /categories/i })).not.toBeInTheDocument();
        });

        it('a project automatically when the current route points to a project sub item.', () => {
            mockUseLiveQuery({
                data: [createProject({ id: 'project-alpha', name: 'Alpha Project', requirementCount: 4 })],
            });

            renderSidebar('/projects/project-alpha/categories');

            expect(screen.getByRole('button', { name: /alpha project/i })).toHaveAttribute('aria-expanded', 'true');
            expect(screen.getByRole('link', { name: /categories/i })).toHaveClass(
                'expandable-navigation-item__sub-link--active',
            );
        });
    });

    describe('opens', () => {
        it('the context menu when a project is right-clicked.', () => {
            mockUseLiveQuery({
                data: [createProject({ id: 'project-alpha', name: 'Alpha Project', requirementCount: 4 })],
            });

            renderSidebar();

            fireEvent.contextMenu(screen.getByRole('button', { name: /alpha project/i }));

            expect(mocks.contextMenuShow).toHaveBeenCalledTimes(1);
        });
    });
});
