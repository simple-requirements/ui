import { useSelector } from '@tanstack/react-store';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import type { AdministratorProjectSummary } from '@/api/adminProjectsApi';
import type { UserAdministrationResponse } from '@/api/authApi';
import { ADMINISTRATOR_PROJECTS_ROUTE, getAdministratorProjectRoute } from '@/auth/authRoutes';
import { projectRoleLabel } from '@/auth/projectRoleMetadata';
import { AddProjectMembershipDialog } from '@/pages/Administration/AddProjectMembershipDialog';
import { useAdministratorProjects } from '@/pages/Administration/useAdministratorProjects';
import { ProjectDialog } from '@/components/RootLayout/Sidebar/ProjectDialog';
import {
    actionBarStore,
    clearAdministratorActionRequest,
    setAdministratorProjectActionContext,
} from '@/stores/actionBarStore';

import '@/pages/Administration/AdministratorProjectsPage.scss';

type ProjectDialogState =
    | Readonly<{ mode: 'create' }>
    | Readonly<{ mode: 'rename'; project: AdministratorProjectSummary }>
    | undefined;

function isEligibleMember(user: UserAdministrationResponse): boolean {
    return user.status === 'active' && user.role !== null && user.role !== 'administrator';
}

function ProjectOverview({ projects }: Readonly<{ projects: readonly AdministratorProjectSummary[] }>) {
    return (
        <div className='administrator-projects__table-wrapper ui-table-wrapper'>
            <table className='administrator-projects__table ui-table'>
                <caption>All projects</caption>
                <thead>
                    <tr>
                        <th scope='col'>Project</th>
                        <th scope='col'>Categories</th>
                        <th scope='col'>Requirements</th>
                        <th scope='col'>Memberships</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((project) => (
                        <tr key={project.id}>
                            <th scope='row'>
                                <Link
                                    className='administrator-projects__project-link'
                                    to={getAdministratorProjectRoute(project.id)}>
                                    {project.name}
                                </Link>
                            </th>
                            <td>{project.categoryCount}</td>
                            <td>{project.requirementCount}</td>
                            <td>{project.memberships.length}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ProjectSummary({ project }: Readonly<{ project: AdministratorProjectSummary }>) {
    return (
        <dl className='administrator-projects__summary'>
            <div>
                <dt>Categories</dt>
                <dd>{project.categoryCount}</dd>
            </div>
            <div>
                <dt>Requirements</dt>
                <dd>{project.requirementCount}</dd>
            </div>
        </dl>
    );
}

function CategoryAdministration({ project }: Readonly<{ project: AdministratorProjectSummary }>) {
    return (
        <section
            className='administrator-projects__categories-panel ui-panel ui-panel--rounded ui-panel--spacious'
            aria-labelledby='administrator-project-categories-title'>
            <h3 id='administrator-project-categories-title'>Categories</h3>
            {project.categories.length === 0 ?
                <p>This project has no categories yet.</p>
            :   <table
                    className='administrator-projects__categories-table ui-table'
                    aria-label={`Categories for ${project.name}`}>
                    <thead>
                        <tr>
                            <th scope='col'>Category</th>
                            <th scope='col'>Requirements</th>
                        </tr>
                    </thead>
                    <tbody>
                        {project.categories.map((category) => (
                            <tr key={category.name}>
                                <th scope='row'>{category.name}</th>
                                <td>{category.requirementCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </section>
    );
}

function TicketUrlTemplateAdministration({
    value,
    pending,
    onChange,
    onSave,
}: Readonly<{ value: string; pending: boolean; onChange: (value: string) => void; onSave: () => Promise<void> }>) {
    return (
        <section
            className='administrator-projects__ticket-settings ui-panel ui-panel--rounded ui-panel--spacious'
            aria-labelledby='administrator-ticket-url-title'>
            <h3 id='administrator-ticket-url-title'>Ticket URL template</h3>
            <div
                className={
                    'administrator-projects__ticket-settings-form ui-form ui-form--medium ui-form--flush '
                    + 'ui-form--compact'
                }>
                <label
                    className='ui-label'
                    htmlFor='administrator-ticket-url-template'>
                    URL template
                </label>
                <InputText
                    id='administrator-ticket-url-template'
                    value={value}
                    disabled={pending}
                    className='ui-control ui-control--line ui-control--full'
                    placeholder='https://tracker.example/tickets/{ticket-id}'
                    onChange={(event) => onChange(event.currentTarget.value)}
                />
                <div className='administrator-projects__ticket-settings-actions ui-form-actions'>
                    <Button
                        type='button'
                        label='Save settings'
                        disabled={pending}
                        onClick={() => void onSave()}
                        pt={{ root: { className: 'ui-button ui-button--primary ui-button--form' } }}
                    />
                </div>
            </div>
        </section>
    );
}

function MembershipAdministration({
    project,
    pending,
    onRemove,
}: Readonly<{
    project: AdministratorProjectSummary;
    pending: boolean;
    onRemove: (userId: string) => Promise<unknown>;
}>) {
    return (
        <section
            className='administrator-projects__memberships ui-panel ui-panel--rounded ui-panel--spacious'
            aria-labelledby='administrator-project-memberships-title'>
            <h3 id='administrator-project-memberships-title'>Project memberships</h3>
            {project.memberships.length === 0 ?
                <p>This project has no memberships yet.</p>
            :   <table
                    className='administrator-projects__memberships-table ui-table'
                    aria-label={`Memberships for ${project.name}`}>
                    <thead>
                        <tr>
                            <th scope='col'>User</th>
                            <th scope='col'>Role</th>
                            <th
                                scope='col'
                                className='administrator-projects__actions-column'>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {project.memberships.map((membership) => (
                            <tr key={membership.userId}>
                                <th scope='row'>
                                    {membership.displayName} <small>@{membership.username}</small>
                                </th>
                                <td>{projectRoleLabel(membership.role)}</td>
                                <td>
                                    <Button
                                        type='button'
                                        text
                                        rounded
                                        severity='danger'
                                        icon='pi pi-user-minus'
                                        aria-label={`Remove ${membership.displayName} from project`}
                                        title='Remove membership'
                                        disabled={pending}
                                        onClick={() => void onRemove(membership.userId)}
                                        pt={{ root: { className: 'ui-button ui-button--icon-only' } }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </section>
    );
}

/** Renders the dedicated Administrator project overview and project metadata. */
export function AdministratorProjectsPage() {
    const administration = useAdministratorProjects();
    const { projectId: selectedProjectId } = useParams<{ projectId?: string }>();
    const navigate = useNavigate();
    const administratorActionRequest = useSelector(actionBarStore, (state) => state.administratorActionRequest);
    const [projectDialog, setProjectDialog] = useState<ProjectDialogState>();
    const [deleteProject, setDeleteProject] = useState<AdministratorProjectSummary>();
    const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
    const selectedProject = administration.projects.find((project) => project.id === selectedProjectId);
    const [ticketUrlTemplate, setTicketUrlTemplate] = useState('');

    const availableMembershipUsers = useMemo(() => {
        if (selectedProject === undefined) return [];
        const memberIds = new Set(selectedProject.memberships.map((membership) => membership.userId));
        return administration.users.filter((user) => isEligibleMember(user) && !memberIds.has(user.id));
    }, [administration.users, selectedProject]);

    useEffect(() => {
        setTicketUrlTemplate(selectedProject?.ticketUrlTemplate ?? '');
    }, [selectedProject?.id, selectedProject?.ticketUrlTemplate]);

    useEffect(() => {
        setAdministratorProjectActionContext({
            selected: selectedProject !== undefined,
            pending: administration.mutationPending,
            addMembershipDisabled:
                administration.usersLoading || administration.usersError || availableMembershipUsers.length === 0,
            deleteDisabled: selectedProject === undefined || selectedProject.requirementCount > 0,
        });
        return () => setAdministratorProjectActionContext(undefined);
    }, [
        administration.mutationPending,
        administration.usersError,
        administration.usersLoading,
        availableMembershipUsers.length,
        selectedProject,
    ]);

    useEffect(() => {
        if (administratorActionRequest === undefined) return;
        clearAdministratorActionRequest();

        switch (administratorActionRequest) {
            case 'createProject':
                setProjectDialog({ mode: 'create' });
                return;
            case 'renameProject':
                if (selectedProject !== undefined) setProjectDialog({ mode: 'rename', project: selectedProject });
                return;
            case 'deleteProject':
                if (selectedProject?.requirementCount === 0) {
                    setDeleteProject(selectedProject);
                }
                return;
            case 'addMembership':
                if (selectedProject !== undefined) setMembershipDialogOpen(true);
                return;
            case 'toggleUserStatus':
                return;
        }
    }, [administratorActionRequest, selectedProject]);

    async function submitProjectName(name: string): Promise<void> {
        if (projectDialog?.mode === 'rename') {
            await administration.updateProject({ projectId: projectDialog.project.id, data: { name } });
            setProjectDialog(undefined);
            return;
        }
        const created = await administration.createProject(name);
        setProjectDialog(undefined);
        void navigate(getAdministratorProjectRoute(created.id));
    }

    async function confirmDelete(): Promise<void> {
        if (deleteProject === undefined) return;
        await administration.deleteProject(deleteProject.id);
        setDeleteProject(undefined);
        void navigate(ADMINISTRATOR_PROJECTS_ROUTE);
    }

    async function saveTicketUrlTemplate(): Promise<void> {
        if (selectedProject === undefined) return;
        await administration.updateProject({
            projectId: selectedProject.id,
            data: { ticketUrlTemplate: ticketUrlTemplate.trim().length === 0 ? null : ticketUrlTemplate.trim() },
        });
    }

    return (
        <section
            className='administrator-projects'
            aria-labelledby='administrator-projects-title'>
            <header>
                <h1 id='administrator-projects-title'>Projects</h1>
            </header>

            {administration.projectsError ?
                <p
                    role='alert'
                    className='administrator-projects__error'>
                    Projects could not be loaded.
                </p>
            : administration.projectsLoading ?
                <p>Loading projects …</p>
            : selectedProjectId === undefined ?
                <ProjectOverview projects={administration.projects} />
            : selectedProject === undefined ?
                <section className='administrator-projects__details ui-panel ui-panel--rounded ui-panel--spacious'>
                    <p role='alert'>The selected project could not be found.</p>
                </section>
            :   <div className='administrator-projects__workspace'>
                    <section
                        className='administrator-projects__details ui-panel ui-panel--rounded ui-panel--spacious'
                        aria-labelledby='administrator-project-title'>
                        <h2 id='administrator-project-title'>{selectedProject.name}</h2>
                        <ProjectSummary project={selectedProject} />
                    </section>
                    <CategoryAdministration project={selectedProject} />
                    <TicketUrlTemplateAdministration
                        value={ticketUrlTemplate}
                        pending={administration.mutationPending}
                        onChange={setTicketUrlTemplate}
                        onSave={saveTicketUrlTemplate}
                    />
                    <MembershipAdministration
                        project={selectedProject}
                        pending={administration.mutationPending}
                        onRemove={(userId) =>
                            administration.removeMembership({ projectId: selectedProject.id, userId })
                        }
                    />
                </div>
            }

            {administration.usersError && (
                <p
                    role='alert'
                    className='administrator-projects__error'>
                    Users could not be loaded; project memberships cannot be changed.
                </p>
            )}
            {administration.mutationError && (
                <p
                    role='alert'
                    className='administrator-projects__error'>
                    The project administration change could not be completed.
                </p>
            )}

            <ProjectDialog
                visible={projectDialog !== undefined}
                mode={projectDialog?.mode ?? 'create'}
                initialName={projectDialog?.mode === 'rename' ? projectDialog.project.name : ''}
                pending={administration.mutationPending}
                onCancel={() => setProjectDialog(undefined)}
                onSubmit={({ name }) => submitProjectName(name)}
            />

            <AddProjectMembershipDialog
                visible={membershipDialogOpen}
                users={availableMembershipUsers}
                pending={administration.mutationPending}
                onHide={() => setMembershipDialogOpen(false)}
                onAdd={async (userId) => {
                    if (selectedProject === undefined) return;
                    await administration.addMembership({ projectId: selectedProject.id, userId });
                }}
            />

            <Dialog
                visible={deleteProject !== undefined}
                modal
                header='Delete project'
                pt={{
                    root: { className: 'ui-dialog ui-dialog--compact' },
                    header: { className: 'ui-dialog__header' },
                    content: { className: 'ui-dialog__content' },
                }}
                onHide={() => setDeleteProject(undefined)}>
                <p className='ui-dialog__message'>
                    Delete <strong>{deleteProject?.name}</strong>? This action cannot be undone.
                </p>
                <div className='administrator-projects__dialog-actions ui-dialog__actions ui-dialog__actions--flush'>
                    <Button
                        type='button'
                        label='Cancel'
                        outlined
                        pt={{ root: { className: 'ui-button ui-button--outline ui-button--dialog' } }}
                        disabled={administration.mutationPending}
                        onClick={() => setDeleteProject(undefined)}
                    />
                    <Button
                        type='button'
                        label='Delete'
                        severity='danger'
                        pt={{ root: { className: 'ui-button ui-button--danger ui-button--dialog' } }}
                        disabled={administration.mutationPending}
                        onClick={() => void confirmDelete()}
                    />
                </div>
            </Dialog>
        </section>
    );
}
