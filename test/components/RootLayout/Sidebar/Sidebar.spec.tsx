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
    SidebarContextMenu: ({
        contextMenuRef,
        onRenameProject,
        onDeleteProject,
        onExportProject,
        onExportAllProjects,
    }: {
        contextMenuRef: unknown;
        onRenameProject?: () => void;
        onDeleteProject?: () => void;
        onExportProject?: () => void;
        onExportAllProjects?: () => void;
    }) => {
        (contextMenuRef as { current: { show: (event: unknown) => void } | null }).current = {
            show: mocks.contextMenuShow,
        };

        return (
            <nav aria-label='Sidebar context menu'>
                <button
                    type='button'
                    onClick={onRenameProject}>
                    Rename project
                </button>
                <button
                    type='button'
                    onClick={onDeleteProject}>
                    Delete project
                </button>
                <button
                    type='button'
                    onClick={onExportProject}>
                    Export project
                </button>
                <button
                    type='button'
                    onClick={onExportAllProjects}>
                    Export all projects
                </button>
            </nav>
        );
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
    it('renders the main sidebar regions.', () => {
        mockUseLiveQuery({ data: [] });

        renderSidebar();

        expect(screen.getByRole('complementary', { name: /projects/i })).toBeInTheDocument();
        expect(screen.getByRole('group', { name: /project actions/i })).toBeInTheDocument();
        expect(screen.getByRole('navigation', { name: /project list/i })).toBeInTheDocument();
        expect(screen.getByRole('navigation', { name: /sidebar context menu/i })).toBeInTheDocument();
    });

    it('sorts projects by name before rendering the navigation list.', () => {
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

        expect(projectButtons.map((button) => button.textContent.trim())).toEqual([
            'Alpha Project4',
            'Beta Project7',
            'Zeta Project2',
        ]);
    });

    it('opens a project and updates the route-driven active sub item.', async () => {
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
        expect(screen.getByRole('link', { name: /requirements/i })).toHaveAttribute('aria-current', 'page');

        await user.click(screen.getByRole('link', { name: /categories/i }));

        expect(alphaButton).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('link', { name: /categories/i })).toHaveAttribute('aria-current', 'page');
    });

    it('opens the context menu for the right-clicked project and opens the rename dialog from that action.', async () => {
        const user = userEvent.setup();

        mockUseLiveQuery({
            data: [createProject({ id: 'project-alpha', name: 'Alpha Project', requirementCount: 4 })],
        });

        renderSidebar();

        fireEvent.contextMenu(screen.getByRole('button', { name: /alpha project/i }));
        await user.click(screen.getByRole('button', { name: /rename project/i }));

        expect(mocks.contextMenuShow).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('heading', { name: /rename project/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/project name/i)).toHaveValue('Alpha Project');
    });

    it('opens the create dialog from the New project action.', async () => {
        const user = userEvent.setup();

        mockUseLiveQuery({ data: [] });

        renderSidebar();

        await user.click(screen.getByRole('button', { name: /new project/i }));

        expect(screen.getByRole('heading', { name: /create project/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/project name/i)).toHaveValue('');
    });
});
