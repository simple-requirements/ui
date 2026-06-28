import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';

import '@/components/RootLayout/Sidebar/SidebarEntry.scss';

export type SidebarEntryProps = Readonly<{
    projectName: string;
    requirementCount: number;
    selected?: boolean;
    onClick?: () => void;
}>;

function getSidebarEntryClassName(selected: boolean): string {
    return selected ? 'sidebar-entry sidebar-entry--selected' : 'sidebar-entry';
}

function getProjectIconClassName(selected: boolean): string {
    return selected ? 'pi pi-folder-open sidebar-entry__icon' : 'pi pi-folder sidebar-entry__icon';
}

export function SidebarEntry({ projectName, requirementCount, selected = false, onClick }: SidebarEntryProps) {
    return (
        <Button
            outlined
            type='button'
            aria-current={selected ? 'page' : undefined}
            onClick={onClick}
            pt={{ root: { className: getSidebarEntryClassName(selected) } }}>
            <span className='sidebar-entry__content'>
                <i
                    className={getProjectIconClassName(selected)}
                    aria-hidden='true'
                />

                <span className='sidebar-entry__label'>{projectName}</span>

                <Badge
                    value={requirementCount}
                    className='sidebar-entry__badge'
                />
            </span>
        </Button>
    );
}
