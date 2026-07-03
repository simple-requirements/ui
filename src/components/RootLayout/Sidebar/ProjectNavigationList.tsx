import type { MouseEvent } from 'react';

import type { SidebarProject } from '@/api/collections/projectsCollection';
import { ExpandableNavigationItem } from '@/components/Navigation/ExpandableNavigationItem';
import { getProjectCategoriesRoute, getProjectRequirementsRoute } from '@/router/projectRoutes';

import type { ActiveProjectRoute } from '@/components/RootLayout/Sidebar/useActiveProjectRoute';

export type ProjectNavigationListProps = Readonly<{
    projects: readonly SidebarProject[];
    activeProjectRoute: ActiveProjectRoute;
    expandedProjectId: string | undefined;
    onToggleProject: (projectId: string) => void;
    onOpenProjectSubItem: (projectId: string) => void;
    onProjectContextMenu: (projectId: string, event: MouseEvent<HTMLButtonElement>) => void;
}>;

export function ProjectNavigationList({
    projects,
    activeProjectRoute,
    expandedProjectId,
    onToggleProject,
    onOpenProjectSubItem,
    onProjectContextMenu,
}: ProjectNavigationListProps) {
    return (
        <nav
            className='sidebar__project-navigation'
            aria-label='Project list'>
            {projects.length === 0 && <p className='sidebar__status'>No projects available.</p>}

            {projects.length > 0 && (
                <ul className='sidebar__project-list'>
                    {projects.map((project) => (
                        <ExpandableNavigationItem
                            key={project.id}
                            label={project.name}
                            badgeValue={project.requirementCount}
                            expanded={project.id === expandedProjectId}
                            active={
                                project.id === activeProjectRoute.projectId && activeProjectRoute.subRoute === undefined
                            }
                            subItems={[
                                {
                                    id: 'requirements',
                                    label: 'Requirements',
                                    to: getProjectRequirementsRoute(project.id),
                                    iconClassName: 'pi pi-list',
                                },
                                {
                                    id: 'categories',
                                    label: 'Categories',
                                    to: getProjectCategoriesRoute(project.id),
                                    iconClassName: 'pi pi-tags',
                                },
                            ]}
                            onToggle={() => onToggleProject(project.id)}
                            onSubItemClick={() => onOpenProjectSubItem(project.id)}
                            onContextMenu={(event) => onProjectContextMenu(project.id, event)}
                        />
                    ))}
                </ul>
            )}
        </nav>
    );
}
