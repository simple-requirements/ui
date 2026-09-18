import type { MouseEvent } from 'react';

import type { SidebarProject } from '@/api/collections/projectsCollection';
import { ExpandableNavigationItem } from '@/components/Navigation/ExpandableNavigationItem';
import {
    getProjectCategoriesRoute,
    getProjectRequirementsRoute,
    type ActiveProjectRoute,
    type ProjectSubRoute,
} from '@/router/projectRoutes';

export type ProjectNavigationListProps = Readonly<{
    projects: readonly SidebarProject[];
    activeProjectRoute: ActiveProjectRoute;
    expandedProjectId: string | undefined;
    onToggleProject: (projectId: string) => void;
    onOpenProjectSubItem: (projectId: string) => void;
    onProjectContextMenu: (projectId: string, event: MouseEvent<HTMLButtonElement>) => void;
    onProjectIntent: (projectId: string, subRoute?: ProjectSubRoute) => void;
}>;

export function ProjectNavigationList({
    projects,
    activeProjectRoute,
    expandedProjectId,
    onToggleProject,
    onOpenProjectSubItem,
    onProjectContextMenu,
    onProjectIntent,
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
                                    onIntent: () => onProjectIntent(project.id, 'requirements'),
                                },
                                {
                                    id: 'categories',
                                    label: 'Categories',
                                    to: getProjectCategoriesRoute(project.id),
                                    iconClassName: 'pi pi-tags',
                                    onIntent: () => onProjectIntent(project.id, 'categories'),
                                },
                            ]}
                            onToggle={() => onToggleProject(project.id)}
                            onIntent={() => onProjectIntent(project.id)}
                            onSubItemClick={() => onOpenProjectSubItem(project.id)}
                            onContextMenu={(event) => onProjectContextMenu(project.id, event)}
                        />
                    ))}
                </ul>
            )}
        </nav>
    );
}
