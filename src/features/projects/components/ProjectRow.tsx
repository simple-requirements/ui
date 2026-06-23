import { Button } from 'primereact/button';
import type { ProjectSummary } from '@/types/domain';

type ProjectRowProps = Readonly<{ project: ProjectSummary; active: boolean; onSelect: () => void }>;

/** Renders a compact project row with a static decorative PrimeIcons folder. */
export function ProjectRow({ project, active, onSelect }: ProjectRowProps) {
    return (
        <Button
            type='button'
            className={`project-sidebar__row project-row ${active ? 'project-sidebar__row--active active' : ''}`}
            onClick={onSelect}
            aria-current={active ? 'true' : undefined}>
            <span
                className='project-sidebar__row-icon pi pi-folder'
                aria-hidden='true'
            />
            <span className='project-sidebar__row-name'>{project.name}</span>
            <span className='project-sidebar__row-count'>{project.requirementCount}</span>
        </Button>
    );
}
