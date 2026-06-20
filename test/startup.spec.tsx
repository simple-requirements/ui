import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DEMO_DATA_KEY } from '@/demo/demoConfig';
import { initialProjects, initialRequirements } from '@/demo/demoData';
import { requirementDetailFromLiveRows } from '@/utils/requirementQueries';
import { initialWorkspaceState, workspaceReducer } from '@/state/workspaceReducer';
import {
    categoriesCollection,
    clearCollection,
    projectsCollection,
    requirementDetailsCollection,
    requirementsCollection,
} from '@/utils/dbCollections';
import type { RequirementView } from '@/types/domain';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;

const renderApp = () => {
    const host = document.createElement('div');
    document.body.append(host);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    root = createRoot(host);
    act(() => {
        root?.render(
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>,
        );
    });
    return host;
};

const waitFor = async (assertion: () => void) => {
    const started = Date.now();
    let lastError: unknown;
    while (Date.now() - started < 2500) {
        try {
            assertion();
            return;
        } catch (error) {
            lastError = error;
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 25));
            });
        }
    }
    throw lastError;
};

const toRequirementDto = (requirement: (typeof initialRequirements)[number]) => ({
    id: requirement.id,
    visibleKey: requirement.visibleKey,
    type: requirement.type,
    projectId: requirement.projectId,
    categoryId: requirement.categoryKey,
    sequenceNumber: Number(requirement.visibleKey.slice(-4)),
    status: requirement.status,
    description: requirement.description,
    renderedDescription: requirement.description,
    metricReferences: [],
    priority: requirement.priority,
    owner: requirement.owner,
    rationale: requirement.rationale,
    source: requirement.source,
    rejectionReason: null,
    reviewer: null,
    rejectedAt: null,
    deletedAt: null,
    approvedAt: null,
    implementedAt: null,
    obsolescenceReason: null,
    obsoleteAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
});

beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.test');
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
        const url = new URL(input instanceof Request ? input.url : String(input));
        if (url.pathname === '/projects') {
            return Promise.resolve(
                new Response(
                    JSON.stringify(
                        initialProjects().map((project) => ({
                            ...project,
                            createdAt: '2026-01-01T00:00:00Z',
                            updatedAt: '2026-01-01T00:00:00Z',
                        })),
                    ),
                    { status: 200 },
                ),
            );
        }
        if (url.pathname === '/requirements') {
            const projectId = url.searchParams.get('projectId');
            return Promise.resolve(
                new Response(
                    JSON.stringify(initialRequirements.filter((r) => r.projectId === projectId).map(toRequirementDto)),
                    { status: 200 },
                ),
            );
        }
        if (url.pathname.startsWith('/requirements/')) {
            const id = decodeURIComponent(url.pathname.replace('/requirements/', ''));
            const requirement = initialRequirements.find((r) => r.id === id);
            if (!requirement)
                return Promise.resolve(new Response(JSON.stringify({ message: 'Not found.' }), { status: 404 }));
            if (url.searchParams.get('demoError') === 'requirement') {
                return Promise.resolve(
                    new Response(JSON.stringify({ message: 'Demo requirement detail failed to load.' }), {
                        status: 500,
                    }),
                );
            }
            return Promise.resolve(new Response(JSON.stringify(toRequirementDto(requirement)), { status: 200 }));
        }
        return Promise.resolve(new Response(JSON.stringify({ message: 'Not found.' }), { status: 404 }));
    });
    history.replaceState(null, '', '/');
    sessionStorage.clear();
    clearCollection(projectsCollection);
    clearCollection(categoriesCollection);
    clearCollection(requirementsCollection);
    clearCollection(requirementDetailsCollection);
});

afterEach(() => {
    act(() => root?.unmount());
    root = null;
    document.body.replaceChildren();
    sessionStorage.clear();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

describe('startup rendering', () => {
    it('renders the shell, New Project button, and eight demo project rows', async () => {
        renderApp();

        await waitFor(() => {
            expect(document.querySelector('.app-shell')).not.toBeNull();
            expect(document.querySelector('.new-project')?.textContent).toContain('New Project');
            expect(document.querySelectorAll('.project-row')).toHaveLength(8);
            expect(document.body.textContent).toContain('Requirements Platform');
        });
    });

    it('renders with an empty project array and no selected requirement', async () => {
        sessionStorage.setItem(DEMO_DATA_KEY, JSON.stringify({ projects: [], requirements: [], categories: [] }));
        vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
        renderApp();

        await waitFor(() => {
            expect(document.querySelector('.app-shell')).not.toBeNull();
            expect(document.querySelectorAll('.project-row')).toHaveLength(0);
            expect(document.body.textContent).toContain('New Project');
        });
    });

    it('contains requirement detail failures in the lower pane while retaining the sidebar', async () => {
        vi.mocked(globalThis.fetch).mockImplementation((input) => {
            const url = new URL(input instanceof Request ? input.url : String(input));
            if (url.pathname === '/projects') {
                return Promise.resolve(
                    new Response(
                        JSON.stringify(
                            initialProjects().map((project) => ({
                                ...project,
                                createdAt: '2026-01-01T00:00:00Z',
                                updatedAt: '2026-01-01T00:00:00Z',
                            })),
                        ),
                        { status: 200 },
                    ),
                );
            }
            if (url.pathname === '/requirements') {
                const projectId = url.searchParams.get('projectId');
                return Promise.resolve(
                    new Response(
                        JSON.stringify(
                            initialRequirements.filter((r) => r.projectId === projectId).map(toRequirementDto),
                        ),
                        { status: 200 },
                    ),
                );
            }
            if (url.pathname.startsWith('/requirements/')) {
                return Promise.resolve(
                    new Response(JSON.stringify({ message: 'Demo requirement detail failed to load.' }), {
                        status: 500,
                    }),
                );
            }
            return Promise.resolve(new Response(JSON.stringify({ message: 'Not found.' }), { status: 404 }));
        });
        renderApp();

        await waitFor(() => {
            expect(document.querySelectorAll('.project-row')).toHaveLength(8);
            expect(document.body.textContent).toContain('Network request failed.');
        });
    });
});

describe('safe selection and detail helpers', () => {
    const requirement: RequirementView = {
        id: 'requirement-1',
        projectId: 'project-1',
        visibleKey: 'FR-AUTH-0001',
        categoryId: 'AUTH',
        categoryKey: 'AUTH',
        categoryName: 'Authentication',
        type: 'FR',
        description: 'The system shall authenticate users.',
        priority: 'P1',
        status: 'draft',
        owner: null,
        rationale: null,
        source: null,
    };

    it('does not index into undefined live detail rows', () => {
        expect(requirementDetailFromLiveRows(undefined, undefined)).toBeUndefined();
        expect(requirementDetailFromLiveRows(undefined, requirement)).toBe(requirement);
        expect(requirementDetailFromLiveRows([], requirement)).toBe(requirement);
        expect(requirementDetailFromLiveRows([requirement], undefined)).toBe(requirement);
    });

    it('clears incompatible requirement selection when the project changes', () => {
        const selected = workspaceReducer(initialWorkspaceState, {
            type: 'selectRequirement',
            requirementId: 'requirement-1',
        });
        const projectChanged = workspaceReducer(selected, { type: 'selectProject', projectId: 'project-2' });

        expect(projectChanged.selectedRequirementId).toBeNull();
    });

    it('demo fixtures provide exactly eight projects for initial selection after data exists', () => {
        const projects = initialProjects();
        expect(projects).toHaveLength(8);
        expect(projects[0]?.name).toContain('Requirements Platform');
    });
});

describe('error boundary', () => {
    it('shows a controlled fallback instead of a blank screen', () => {
        const Broken = () => {
            throw new Error('boom');
        };
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const host = document.createElement('div');
        document.body.append(host);
        root = createRoot(host);

        act(() => {
            root?.render(
                <ErrorBoundary>
                    <Broken />
                </ErrorBoundary>,
            );
        });

        expect(document.body.textContent).toContain('Something went wrong');
        expect(document.body.textContent).toContain('Reload');
        expect(consoleSpy).toHaveBeenCalled();
    });
});
