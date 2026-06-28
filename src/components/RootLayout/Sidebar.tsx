import { Button } from 'primereact/button';

import { ActionButton } from '@/components/RootLayout/ActionButton';

import '@/components/RootLayout/Sidebar.scss';

const placeholderProjects = ['Reporting and Analytics', 'Usability Improvements', 'Platform Foundation'];

function getProjectButtonClassName(selected: boolean): string {
    return selected ? 'sidebar__project sidebar__project--selected' : 'sidebar__project';
}

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
                    {placeholderProjects.map((projectName, index) => (
                        <li key={projectName}>
                            <Button
                                outlined
                                type='button'
                                label={projectName}
                                pt={{
                                    root: { className: getProjectButtonClassName(index === 0) },
                                    label: { className: 'sidebar__project-label' },
                                }}
                            />
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
