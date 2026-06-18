import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DEMO_DATA_KEY } from '@/demo/demoConfig';
import { initialProjects } from '@/demo/demoData';
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

beforeEach(() => {
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
        renderApp();

        await waitFor(() => {
            expect(document.querySelector('.app-shell')).not.toBeNull();
            expect(document.querySelectorAll('.project-row')).toHaveLength(0);
            expect(document.body.textContent).toContain('New Project');
        });
    });

    it('contains requirement detail failures in the lower pane while retaining the sidebar', async () => {
        history.replaceState(null, '', '/?demoError=requirement');
        renderApp();

        await waitFor(() => {
            expect(document.querySelectorAll('.project-row')).toHaveLength(8);
            expect(document.body.textContent).toContain('Demo requirement detail failed to load.');
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
