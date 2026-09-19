import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ActiveProjectRoute } from '@/router/projectRoutes';
import { useProjectNavigation } from '@/components/RootLayout/Sidebar/useProjectNavigation';

const mocks = vi.hoisted(() => ({
    prefetchProjectCategories: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    prefetchProjectDetails: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    prefetchProjectRequirements: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    preloadProjectCategoriesListRoute: vi.fn(),
    preloadProjectDetailsRoute: vi.fn(),
    preloadProjectRequirementsListRoute: vi.fn(),
}));

vi.mock('@/api/projectPrefetch', () => ({
    prefetchProjectCategories: mocks.prefetchProjectCategories,
    prefetchProjectDetails: mocks.prefetchProjectDetails,
    prefetchProjectRequirements: mocks.prefetchProjectRequirements,
}));

vi.mock('@/router/routeModules', () => ({
    preloadProjectCategoriesListRoute: mocks.preloadProjectCategoriesListRoute,
    preloadProjectDetailsRoute: mocks.preloadProjectDetailsRoute,
    preloadProjectRequirementsListRoute: mocks.preloadProjectRequirementsListRoute,
}));


type ProbeProps = Readonly<{ activeProjectRoute: ActiveProjectRoute }>;

function ProjectNavigationProbe({ activeProjectRoute }: ProbeProps) {
    const controller = useProjectNavigation(activeProjectRoute);
    const location = useLocation();

    return (
        <div>
            <output aria-label='Expanded project'>{controller.expandedProjectId ?? 'none'}</output>
            <output aria-label='Current route'>{location.pathname}</output>
            <button
                type='button'
                onClick={() => controller.toggleProject('project-alpha')}>
                Toggle Alpha
            </button>
            <button
                type='button'
                onClick={() => controller.openProjectSubItem('project-beta')}>
                Open Beta sub item
            </button>
            <button
                type='button'
                onClick={() => controller.prefetchProjectRoute('project-alpha')}>
                Prefetch Alpha overview
            </button>
            <button
                type='button'
                onClick={() => controller.prefetchProjectRoute('project-alpha', 'requirements')}>
                Prefetch Alpha requirements
            </button>
            <button
                type='button'
                onClick={() => controller.prefetchProjectRoute('project-alpha', 'categories')}>
                Prefetch Alpha categories
            </button>
        </div>
    );
}

function renderProjectNavigationProbe(
    activeProjectRoute: ActiveProjectRoute,
    initialEntry = '/',
): ReturnType<typeof render> {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <ProjectNavigationProbe activeProjectRoute={activeProjectRoute} />
        </MemoryRouter>,
    );
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('useProjectNavigation', () => {
    it('starts expanded when the active route points to a project sub route.', () => {
        renderProjectNavigationProbe({ projectId: 'project-alpha', subRoute: 'categories' });

        expect(screen.getByLabelText('Expanded project')).toHaveTextContent('project-alpha');
    });

    it('opens a collapsed project and navigates to its project details route.', async () => {
        const user = userEvent.setup();

        renderProjectNavigationProbe({});

        await user.click(screen.getByRole('button', { name: /toggle alpha/i }));

        expect(screen.getByLabelText('Expanded project')).toHaveTextContent('project-alpha');
        await waitFor(() => {
            expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-alpha');
        });
    });

    it('collapses an expanded project and navigates to its project overview route.', async () => {
        const user = userEvent.setup();

        renderProjectNavigationProbe(
            { projectId: 'project-alpha', subRoute: 'requirements' },
            '/projects/project-alpha/requirements',
        );

        await user.click(screen.getByRole('button', { name: /toggle alpha/i }));

        expect(screen.getByLabelText('Expanded project')).toHaveTextContent('none');
        await waitFor(() => {
            expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-alpha');
        });
    });

    it('keeps a project expanded when one of its sub items is opened.', async () => {
        const user = userEvent.setup();

        renderProjectNavigationProbe({});

        await user.click(screen.getByRole('button', { name: /open beta sub item/i }));

        expect(screen.getByLabelText('Expanded project')).toHaveTextContent('project-beta');
    });
    it('prefetches route code and matching project data for navigation intent.', async () => {
        const user = userEvent.setup();

        renderProjectNavigationProbe({});

        await user.click(screen.getByRole('button', { name: /prefetch alpha overview/i }));
        await user.click(screen.getByRole('button', { name: /prefetch alpha requirements/i }));
        await user.click(screen.getByRole('button', { name: /prefetch alpha categories/i }));

        expect(mocks.preloadProjectDetailsRoute).toHaveBeenCalledOnce();
        expect(mocks.prefetchProjectDetails).toHaveBeenCalledWith('project-alpha');
        expect(mocks.preloadProjectRequirementsListRoute).toHaveBeenCalledOnce();
        expect(mocks.prefetchProjectRequirements).toHaveBeenCalledWith('project-alpha');
        expect(mocks.preloadProjectCategoriesListRoute).toHaveBeenCalledOnce();
        expect(mocks.prefetchProjectCategories).toHaveBeenCalledWith('project-alpha');
    });

});
