import { useLiveQuery } from '@tanstack/react-db';

import { projectsCollection } from '@/api/collections/projectsCollection';
import { ActionButton } from '@/components/RootLayout/Sidebar/ActionButton';
import { SidebarEntry } from '@/components/RootLayout/Sidebar/SidebarEntry';

import '@/components/RootLayout/Sidebar/Sidebar.scss';

export function Sidebar() {
    const {
        data: projects,
        isLoading,
        isError,
    } = useLiveQuery((query) => query.from({ projects: projectsCollection }));

    const sortedProjects = [...projects].sort((left, right) => left.name.localeCompare(right.name));

    return (
        <aside
            className='sidebar'
            aria-label='Projects'>
            <div
                className='sidebar__actions'
                role='group'
                aria-label='Project actions'>
                <ActionButton />
            </div>

            <nav
                className='sidebar__project-navigation'
                aria-label='Project list'>
                {isLoading && <p className='sidebar__status'>Loading projects …</p>}

                {isError && <p className='sidebar__status sidebar__status--error'>Projects could not be loaded.</p>}

                {!isLoading && !isError && sortedProjects.length === 0 && (
                    <p className='sidebar__status'>No projects available.</p>
                )}

                {!isLoading && !isError && sortedProjects.length > 0 && (
                    <ul className='sidebar__project-list'>
                        {sortedProjects.map((project, index) => (
                            <li key={project.id}>
                                <SidebarEntry
                                    projectName={project.name}
                                    requirementCount={project.requirementCount}
                                    selected={index === 0}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </nav>
        </aside>
    );
}
