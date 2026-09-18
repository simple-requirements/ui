import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdministratorSidebar } from '@/components/RootLayout/AdministratorSidebar/AdministratorSidebar';

const mocks = vi.hoisted(() => ({ listUsers: vi.fn(), listAdministratorProjects: vi.fn() }));

vi.mock('@/api/authApi', () => ({ listUsers: mocks.listUsers }));

vi.mock('@/api/adminProjectsApi', () => ({ listAdministratorProjects: mocks.listAdministratorProjects }));

function renderSidebar(initialEntry = '/admin/users') {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route
                        path='/admin/users/:userId?'
                        element={<AdministratorSidebar />}
                    />
                    <Route
                        path='/admin/projects/:projectId?'
                        element={<AdministratorSidebar />}
                    />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('AdministratorSidebar', () => {
    it('expands Users & Sessions and renders all users as navigation children', async () => {
        mocks.listUsers.mockResolvedValue({
            data: [
                {
                    id: '11111111-1111-4111-8111-111111111111',
                    username: 'developer',
                    email: 'developer@example.org',
                    displayName: 'Developer',
                    status: 'active',
                    role: 'developer',
                    emailVerifiedAt: '2026-09-01T10:00:00.000Z',
                    createdAt: '2026-09-01T09:00:00.000Z',
                    updatedAt: '2026-09-01T10:00:00.000Z',
                },
            ],
        });
        mocks.listAdministratorProjects.mockResolvedValue([]);

        renderSidebar();

        expect(await screen.findByRole('link', { name: 'Developer' })).toHaveAttribute(
            'href',
            '/admin/users/11111111-1111-4111-8111-111111111111',
        );
        expect(screen.getByRole('button', { name: /Users & Sessions/u })).toHaveAttribute('aria-expanded', 'true');
    });

    it('expands Projects and renders all projects as navigation children', async () => {
        mocks.listUsers.mockResolvedValue({ data: [] });
        mocks.listAdministratorProjects.mockResolvedValue([
            {
                id: '22222222-2222-4222-8222-222222222222',
                name: 'Project Alpha',
                categoryNames: [],
                categoryCount: 0,
                requirementCount: 3,
                memberships: [],
                ticketUrlTemplate: null,
            },
        ]);

        renderSidebar('/admin/projects');

        expect(await screen.findByRole('link', { name: /Project Alpha/u })).toHaveAttribute(
            'href',
            '/admin/projects/22222222-2222-4222-8222-222222222222',
        );
    });

    it('navigates to the section overview when a section is toggled', async () => {
        mocks.listUsers.mockResolvedValue({ data: [] });
        mocks.listAdministratorProjects.mockResolvedValue([]);
        const interaction = userEvent.setup();

        renderSidebar('/admin/users');
        await interaction.click(screen.getByRole('button', { name: /Projects/u }));

        expect(screen.getByRole('button', { name: /Projects/u })).toHaveAttribute('aria-expanded', 'true');
    });
});
