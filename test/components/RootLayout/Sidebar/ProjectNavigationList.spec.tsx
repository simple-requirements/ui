import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { SidebarProject } from '@/api/collections/projectsCollection';
import { ProjectNavigationList } from '@/components/RootLayout/Sidebar/ProjectNavigationList';
import type { ActiveProjectRoute } from '@/components/RootLayout/Sidebar/useActiveProjectRoute';

const projects: readonly SidebarProject[] = [
    {
        id: 'project-alpha',
        name: 'Alpha Project',
        createdAt: '2026-06-28T10:00:00.000Z',
        updatedAt: '2026-06-28T10:00:00.000Z',
        requirementCount: 4,
    },
    {
        id: 'project-beta',
        name: 'Beta Project',
        createdAt: '2026-06-28T10:00:00.000Z',
        updatedAt: '2026-06-28T10:00:00.000Z',
        requirementCount: 7,
    },
];

type RenderProjectNavigationListOptions = Readonly<{
    activeProjectRoute?: ActiveProjectRoute;
    expandedProjectId?: string;
    projectList?: readonly SidebarProject[];
    onToggleProject?: (projectId: string) => void;
    onOpenProjectSubItem?: (projectId: string) => void;
    onProjectContextMenu?: (projectId: string, event: React.MouseEvent<HTMLButtonElement>) => void;
}>;

function renderProjectNavigationList(options: RenderProjectNavigationListOptions = {}): ReturnType<typeof render> {
    return render(
        <MemoryRouter initialEntries={['/projects/project-alpha/categories']}>
            <ProjectNavigationList
                projects={options.projectList ?? projects}
                activeProjectRoute={options.activeProjectRoute ?? {}}
                expandedProjectId={options.expandedProjectId}
                onToggleProject={options.onToggleProject ?? vi.fn()}
                onOpenProjectSubItem={options.onOpenProjectSubItem ?? vi.fn()}
                onProjectContextMenu={options.onProjectContextMenu ?? vi.fn()}
            />
        </MemoryRouter>,
    );
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ProjectNavigationList', () => {
    it('renders the empty state.', () => {
        renderProjectNavigationList({ projectList: [] });

        expect(screen.getByRole('navigation', { name: /project list/i })).toBeInTheDocument();
        expect(screen.getByText('No projects available.')).toBeInTheDocument();
    });

    it('renders projects.', () => {
        renderProjectNavigationList();

        expect(screen.getByRole('button', { name: /alpha project/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /beta project/i })).toBeInTheDocument();
    });

    it('renders sub items and the requirements counter behind the project name.', () => {
        renderProjectNavigationList({ expandedProjectId: 'project-alpha' });

        const alphaButton = screen.getByRole('button', { name: /alpha project/i });
        expect(within(alphaButton).getByText('4')).toBeInTheDocument();

        expect(screen.getByRole('link', { name: /requirements/i })).toHaveAttribute(
            'href',
            '/projects/project-alpha/requirements',
        );
        expect(screen.getByRole('link', { name: /categories/i })).toHaveAttribute(
            'href',
            '/projects/project-alpha/categories',
        );
    });

    it('marks the active project overview.', () => {
        renderProjectNavigationList({ activeProjectRoute: { projectId: 'project-alpha' } });

        expect(screen.getByRole('button', { name: /alpha project/i })).toHaveAttribute('aria-current', 'page');
    });

    it('calls the project handlers.', async () => {
        const user = userEvent.setup();
        const onToggleProject = vi.fn();
        const onOpenProjectSubItem = vi.fn();
        const onProjectContextMenu = vi.fn();

        renderProjectNavigationList({
            expandedProjectId: 'project-alpha',
            onToggleProject,
            onOpenProjectSubItem,
            onProjectContextMenu,
        });

        await user.click(screen.getByRole('button', { name: /alpha project/i }));
        await user.click(screen.getByRole('link', { name: /categories/i }));
        fireEvent.contextMenu(screen.getByRole('button', { name: /alpha project/i }));

        expect(onToggleProject).toHaveBeenCalledWith('project-alpha');
        expect(onOpenProjectSubItem).toHaveBeenCalledWith('project-alpha');
        expect(onProjectContextMenu).toHaveBeenCalledTimes(1);
    });

    it('renders projects in the provided order.', () => {
        renderProjectNavigationList({ projectList: projects });

        const navigation = screen.getByRole('navigation', { name: /project list/i });
        const projectButtons = within(navigation).getAllByRole('button');
        expect(projectButtons.map((button) => button.textContent.trim())).toEqual(['Alpha Project4', 'Beta Project7']);
    });
});
