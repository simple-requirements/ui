import { ActionButton } from '@/components/RootLayout/Sidebar/ActionButton';
import { SidebarEntry } from '@/components/RootLayout/Sidebar/SidebarEntry';

import '@/components/RootLayout/Sidebar/Sidebar.scss';

type PlaceholderProject = Readonly<{ name: string; requirementCount: number; selected: boolean }>;

const placeholderProjects: readonly PlaceholderProject[] = [
    { name: 'Reporting and Analytics', requirementCount: 60, selected: true },
    { name: 'Usability Improvements', requirementCount: 24, selected: false },
    { name: 'Platform Foundation', requirementCount: 103, selected: false },
];

export function Sidebar() {
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
                <ul className='sidebar__project-list'>
                    {placeholderProjects.map((project) => (
                        <li key={project.name}>
                            <SidebarEntry
                                projectName={project.name}
                                requirementCount={project.requirementCount}
                                selected={project.selected}
                            />
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
