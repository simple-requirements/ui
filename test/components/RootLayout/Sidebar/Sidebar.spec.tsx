import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, within } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Sidebar } from '@/components/RootLayout/Sidebar/Sidebar';

type TestProject = Readonly<{
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    requirementCount: number;
}>;

type UseLiveQueryResult = Readonly<{ data: readonly TestProject[]; isLoading: boolean; isError: boolean }>;

const mocks = vi.hoisted(() => ({ useLiveQuery: vi.fn() }));

vi.mock('@tanstack/react-db', () => ({ useLiveQuery: mocks.useLiveQuery }));

vi.mock('@/api/collections/projectsCollection', () => ({ projectsCollection: {} }));

function createTestQueryClient(): QueryClient {
    return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function TestQueryClientProvider({ children }: PropsWithChildren): ReactElement {
    const queryClient = createTestQueryClient();

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function renderSidebar(): ReturnType<typeof render> {
    return render(<Sidebar />, { wrapper: TestQueryClientProvider });
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
    mocks.useLiveQuery.mockReturnValue({ data: [], isLoading: false, isError: false, ...result });
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

            expect(screen.getByRole('complementary', { name: /projects/i })).not.toBeNull();
            expect(screen.getByRole('group', { name: /project actions/i })).not.toBeNull();
            expect(screen.getByRole('navigation', { name: /project list/i })).not.toBeNull();
        });

        it('the loading state while projects are loading.', () => {
            mockUseLiveQuery({ data: [], isLoading: true });

            renderSidebar();

            expect(screen.getByText('Loading projects …')).not.toBeNull();
        });

        it('an error message when projects cannot be loaded.', () => {
            mockUseLiveQuery({ data: [], isError: true });

            renderSidebar();

            expect(screen.getByText('Projects could not be loaded.')).not.toBeNull();
        });

        it('the empty state when there are no projects.', () => {
            mockUseLiveQuery({ data: [] });

            renderSidebar();

            expect(screen.getByText('No projects available.')).not.toBeNull();
        });

        it('projects from the collection.', () => {
            mockUseLiveQuery({
                data: [
                    createProject({ id: 'project-alpha', name: 'Alpha Project', requirementCount: 4 }),
                    createProject({ id: 'project-beta', name: 'Beta Project', requirementCount: 7 }),
                ],
            });

            renderSidebar();

            expect(screen.getByRole('button', { name: /alpha project/i })).not.toBeNull();
            expect(screen.getByRole('button', { name: /beta project/i })).not.toBeNull();
            expect(screen.getByText('4')).not.toBeNull();
            expect(screen.getByText('7')).not.toBeNull();
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

            const projectNames = projectButtons.map((button) =>
                button.querySelector('.sidebar-entry__label')?.textContent.trim(),
            );

            expect(projectNames).toEqual(['Alpha Project', 'Beta Project', 'Zeta Project']);
        });

        it('the New project action.', () => {
            mockUseLiveQuery({ data: [] });

            renderSidebar();

            expect(screen.getByRole('button', { name: /new project/i })).not.toBeNull();
        });

        it('the Synchronize projects action.', () => {
            mockUseLiveQuery({ data: [] });

            renderSidebar();

            expect(screen.getByRole('button', { name: /synchronize projects/i })).not.toBeNull();
        });
    });

    it('marks the first sorted project as selected.', () => {
        mockUseLiveQuery({
            data: [
                createProject({ id: 'project-zeta', name: 'Zeta Project', requirementCount: 2 }),
                createProject({ id: 'project-alpha', name: 'Alpha Project', requirementCount: 4 }),
                createProject({ id: 'project-beta', name: 'Beta Project', requirementCount: 7 }),
            ],
        });

        renderSidebar();

        const alphaButton = screen.getByRole('button', { name: /alpha project/i });
        const betaButton = screen.getByRole('button', { name: /beta project/i });
        const zetaButton = screen.getByRole('button', { name: /zeta project/i });

        expect(alphaButton.getAttribute('aria-current')).toBe('page');
        expect(alphaButton.classList.contains('sidebar-entry--selected')).toBe(true);

        expect(betaButton.getAttribute('aria-current')).toBeNull();
        expect(zetaButton.getAttribute('aria-current')).toBeNull();
    });
});
