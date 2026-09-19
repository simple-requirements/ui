import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { listAdministratorProjects } from '@/api/adminProjectsApi';
import { listUsers } from '@/api/authApi';
import {
    ADMINISTRATOR_PROJECTS_ROUTE,
    ADMINISTRATOR_USERS_ROUTE,
    getActiveAdministratorSection,
    getAdministratorProjectRoute,
    getAdministratorUserRoute,
    type AdministratorSection,
} from '@/router/administrationRoutes';
import { ExpandableNavigationItem } from '@/components/Navigation/ExpandableNavigationItem';
import {
    preloadAdministratorProjectsRoute,
    preloadUserAdministrationRoute,
} from '@/router/routeModules';
import {
    administrationProjectsQueryKey,
    administrationUsersQueryKey,
} from '@/pages/Administration/administrationQueryKeys';

import '@/components/RootLayout/AdministratorSidebar/AdministratorSidebar.scss';

/** Renders the dedicated expandable Administrator workspace navigation. */
export function AdministratorSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const activeSection = getActiveAdministratorSection(location.pathname);
    const [expandedSection, setExpandedSection] = useState<AdministratorSection | undefined>(activeSection);
    const usersQuery = useQuery({
        queryKey: administrationUsersQueryKey,
        queryFn: async () => (await listUsers()).data,
    });
    const projectsQuery = useQuery({ queryKey: administrationProjectsQueryKey, queryFn: listAdministratorProjects });

    const userItems = useMemo(
        () =>
            (usersQuery.data ?? []).map((user) => ({
                id: user.id,
                label: user.displayName,
                to: getAdministratorUserRoute(user.id),
                iconClassName: 'pi pi-user',
                onIntent: preloadUserAdministrationRoute,
            })),
        [usersQuery.data],
    );
    const projectItems = useMemo(
        () =>
            (projectsQuery.data ?? []).map((project) => ({
                id: project.id,
                label: project.name,
                to: getAdministratorProjectRoute(project.id),
                iconClassName: 'pi pi-folder',
                badgeValue: project.requirementCount,
                onIntent: preloadAdministratorProjectsRoute,
            })),
        [projectsQuery.data],
    );

    function toggleSection(section: AdministratorSection): void {
        const route = section === 'users' ? ADMINISTRATOR_USERS_ROUTE : ADMINISTRATOR_PROJECTS_ROUTE;
        setExpandedSection((current) => (current === section ? undefined : section));
        void navigate(route);
    }

    return (
        <aside
            className='administrator-sidebar'
            aria-label='Administrator workspace'>
            <div className='administrator-sidebar__header'>Administration</div>
            <nav
                className='administrator-sidebar__navigation'
                aria-label='Administrator sections'>
                <ul className='administrator-sidebar__list'>
                    <ExpandableNavigationItem
                        label='Users & Sessions'
                        badgeValue={usersQuery.data?.length}
                        expanded={expandedSection === 'users'}
                        active={activeSection === 'users' && params.userId === undefined}
                        iconClassName='pi pi-users'
                        expandedIconClassName='pi pi-users'
                        subItems={userItems}
                        onToggle={() => toggleSection('users')}
                        onIntent={preloadUserAdministrationRoute}
                    />
                    <ExpandableNavigationItem
                        label='Projects'
                        badgeValue={projectsQuery.data?.length}
                        expanded={expandedSection === 'projects'}
                        active={activeSection === 'projects' && params.projectId === undefined}
                        iconClassName='pi pi-folder'
                        expandedIconClassName='pi pi-folder-open'
                        subItems={projectItems}
                        onToggle={() => toggleSection('projects')}
                        onIntent={preloadAdministratorProjectsRoute}
                    />
                </ul>
            </nav>
        </aside>
    );
}
