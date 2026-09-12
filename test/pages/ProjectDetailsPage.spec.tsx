import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectDetailsPage } from '@/pages/ProjectDetails/ProjectDetailsPage';

const mocks = vi.hoisted(() => ({
    useProjectDetails: vi.fn(),
    useProjectPermissions: vi.fn(),
}));

vi.mock('@/pages/ProjectDetails/useProjectDetails', () => ({ useProjectDetails: mocks.useProjectDetails }));
vi.mock('@/auth/projectPermissions', () => ({ useProjectPermissions: mocks.useProjectPermissions }));
vi.mock('@/pages/ProjectDetails/ProjectStatistics', () => ({ ProjectStatistics: () => <div>Project statistics</div> }));
vi.mock('@/pages/ProjectDetails/TicketSystemSettings', () => ({
    TicketSystemSettings: () => <div>Ticket system settings</div>,
}));

/**
 * Renders project details for the project-alpha route.
 * @returns Render result for the project details page.
 */
function renderProjectDetailsPage(): ReturnType<typeof render> {
    return render(
        <MemoryRouter initialEntries={['/projects/project-alpha']}>
            <Routes>
                <Route
                    path='/projects/:projectId'
                    element={<ProjectDetailsPage />}
                />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    mocks.useProjectDetails.mockReturnValue({
        project: {
            id: 'project-alpha',
            name: 'Alpha Project',
            createdAt: '2026-09-12T10:00:00.000Z',
            updatedAt: '2026-09-12T11:00:00.000Z',
            ticketUrlTemplate: null,
        },
        categoriesCount: 2,
        requirementsCount: 3,
        requirementStatusStatistics: { draft: 1, approved: 1, implemented: 1, rejected: 0, obsolete: 0 },
        loading: false,
        error: false,
    });
    mocks.useProjectPermissions.mockReturnValue({
        known: true,
        canReadProject: true,
        canAdministerProject: false,
        canManageRequirements: false,
        canManageTickets: false,
    });
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ProjectDetailsPage', () => {
    it('links to requirements for a project-scoped user.', () => {
        renderProjectDetailsPage();

        expect(screen.getByRole('link', { name: 'Open requirements' })).toHaveAttribute(
            'href',
            '/projects/project-alpha/requirements',
        );
    });

    it('keeps the requirements shortcut available for an Administrator.', () => {
        mocks.useProjectPermissions.mockReturnValue({
            known: true,
            canReadProject: true,
            canAdministerProject: true,
            canManageRequirements: false,
            canManageTickets: false,
        });

        renderProjectDetailsPage();

        expect(screen.getByRole('link', { name: 'Open requirements' })).toHaveAttribute(
            'href',
            '/projects/project-alpha/requirements',
        );
    });
});
