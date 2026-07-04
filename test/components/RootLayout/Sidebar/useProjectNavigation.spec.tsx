import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { useProjectNavigation } from '@/components/RootLayout/Sidebar/useProjectNavigation';
import type { ActiveProjectRoute } from '@/components/RootLayout/Sidebar/useActiveProjectRoute';

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
});

describe('useProjectNavigation', () => {
    it('starts expanded when the active route points to a project sub route.', () => {
        renderProjectNavigationProbe({ projectId: 'project-alpha', subRoute: 'categories' });

        expect(screen.getByLabelText('Expanded project')).toHaveTextContent('project-alpha');
    });

    it('opens a collapsed project and navigates to its requirements route.', async () => {
        const user = userEvent.setup();

        renderProjectNavigationProbe({});

        await user.click(screen.getByRole('button', { name: /toggle alpha/i }));

        expect(screen.getByLabelText('Expanded project')).toHaveTextContent('project-alpha');
        await waitFor(() => {
            expect(screen.getByLabelText('Current route')).toHaveTextContent('/projects/project-alpha/requirements');
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
});
