import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useEffect, useMemo, useState } from "react";

import type { AdministratorProjectSummary } from "@/api/adminProjectsApi";
import type { UserAdministrationResponse } from "@/api/authApi";
import { ProjectDialog } from "@/components/RootLayout/Sidebar/ProjectDialog";
import { projectRoleLabel } from "@/auth/projectRoleMetadata";
import { useAdministratorProjects } from "@/pages/Administration/useAdministratorProjects";

import "@/pages/Administration/AdministratorProjectsPage.scss";

type ProjectDialogState =
  | Readonly<{ mode: "create" }>
  | Readonly<{ mode: "rename"; project: AdministratorProjectSummary }>
  | undefined;

function isEligibleMember(user: UserAdministrationResponse): boolean {
  return (
    user.status === "active" &&
    user.role !== null &&
    user.role !== "administrator"
  );
}

function ProjectSummary({
  project,
}: Readonly<{ project: AdministratorProjectSummary }>) {
  return (
    <>
      <dl className="administrator-projects__summary">
        <div>
          <dt>Categories</dt>
          <dd>{project.categoryCount}</dd>
        </div>
        <div>
          <dt>Requirements</dt>
          <dd>{project.requirementCount}</dd>
        </div>
      </dl>
      <div>
        <h3>Category names</h3>
        {project.categoryNames.length === 0 ? (
          <p>No categories.</p>
        ) : (
          <ul className="administrator-projects__categories">
            {project.categoryNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function MembershipAdministration({
  project,
  users,
  pending,
  usersLoading,
  onAdd,
  onRemove,
}: Readonly<{
  project: AdministratorProjectSummary;
  users: readonly UserAdministrationResponse[];
  pending: boolean;
  usersLoading: boolean;
  onAdd: (userId: string) => Promise<unknown>;
  onRemove: (userId: string) => Promise<unknown>;
}>) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const memberIds = useMemo(
    () => new Set(project.memberships.map((membership) => membership.userId)),
    [project.memberships],
  );
  const availableUsers = users.filter(
    (user) => isEligibleMember(user) && !memberIds.has(user.id),
  );

  async function addSelectedMembership(): Promise<void> {
    if (selectedUserId.length === 0) return;
    await onAdd(selectedUserId);
    setSelectedUserId("");
  }

  return (
    <section
      className="administrator-projects__memberships"
      aria-labelledby="administrator-project-memberships-title"
    >
      <h3 id="administrator-project-memberships-title">Project memberships</h3>
      <p>
        Memberships use each account&apos;s single role. Administrator accounts
        cannot be project members.
      </p>

      {usersLoading ? (
        <p>Loading users …</p>
      ) : (
      <div className="administrator-projects__membership-form">
        <label htmlFor="administrator-project-member">User</label>
        <select
          id="administrator-project-member"
          value={selectedUserId}
          disabled={pending || availableUsers.length === 0}
          onChange={(event) => setSelectedUserId(event.currentTarget.value)}
        >
          <option value="">Select a user</option>
          {availableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.displayName} (@{user.username}) —{" "}
              {projectRoleLabel(user.role as Exclude<typeof user.role, null | "administrator">)}
            </option>
          ))}
        </select>
        <Button
          type="button"
          label="Add membership"
          disabled={pending || selectedUserId.length === 0}
          onClick={() => void addSelectedMembership()}
        />
      </div>
      )}

      {project.memberships.length === 0 ? (
        <p>This project has no memberships yet.</p>
      ) : (
        <table
          className="administrator-projects__memberships-table"
          aria-label={`Memberships for ${project.name}`}
        >
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Role</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {project.memberships.map((membership) => (
              <tr key={membership.userId}>
                <th scope="row">
                  {membership.displayName} <small>@{membership.username}</small>
                </th>
                <td>{projectRoleLabel(membership.role)}</td>
                <td>
                  <Button
                    type="button"
                    outlined
                    severity="danger"
                    label="Remove membership"
                    disabled={pending}
                    onClick={() => void onRemove(membership.userId)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

/**
 * Renders project creation, settings, summaries, and memberships in the
 * dedicated Administrator workspace without exposing project content.
 */
export function AdministratorProjectsPage() {
  const administration = useAdministratorProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [projectDialog, setProjectDialog] = useState<ProjectDialogState>();
  const [deleteProject, setDeleteProject] =
    useState<AdministratorProjectSummary>();
  const selectedProject = administration.projects.find(
    (project) => project.id === selectedProjectId,
  );
  const [ticketUrlTemplate, setTicketUrlTemplate] = useState("");

  useEffect(() => {
    if (
      selectedProjectId !== undefined &&
      selectedProject === undefined &&
      !administration.projectsLoading
    ) {
      setSelectedProjectId(undefined);
    }
  }, [
    administration.projectsLoading,
    selectedProject,
    selectedProjectId,
  ]);

  useEffect(() => {
    setTicketUrlTemplate(selectedProject?.ticketUrlTemplate ?? "");
  }, [selectedProject?.id, selectedProject?.ticketUrlTemplate]);

  async function submitProjectName(name: string): Promise<void> {
    if (projectDialog?.mode === "rename") {
      await administration.updateProject({
        projectId: projectDialog.project.id,
        data: { name },
      });
      setProjectDialog(undefined);
      return;
    }

    const created = await administration.createProject(name);
    setSelectedProjectId(created.id);
    setProjectDialog(undefined);
  }

  async function confirmDelete(): Promise<void> {
    if (deleteProject === undefined) return;
    await administration.deleteProject(deleteProject.id);
    if (selectedProjectId === deleteProject.id) {
      setSelectedProjectId(undefined);
    }
    setDeleteProject(undefined);
  }

  async function saveTicketUrlTemplate(): Promise<void> {
    if (selectedProject === undefined) return;
    await administration.updateProject({
      projectId: selectedProject.id,
      data: {
        ticketUrlTemplate:
          ticketUrlTemplate.trim().length === 0
            ? null
            : ticketUrlTemplate.trim(),
      },
    });
  }

  return (
    <section
      className="administrator-projects"
      aria-labelledby="administrator-projects-title"
    >
      <header className="administrator-projects__header">
        <div>
          <p className="administrator-projects__eyebrow">Administration</p>
          <h1 id="administrator-projects-title">Projects</h1>
        </div>
        <Button
          type="button"
          label="New project"
          icon="pi pi-plus"
          disabled={administration.mutationPending}
          onClick={() => setProjectDialog({ mode: "create" })}
        />
      </header>

      {administration.projectsError ? (
        <p role="alert" className="administrator-projects__error">
          Projects could not be loaded.
        </p>
      ) : administration.projectsLoading ? (
        <p>Loading projects …</p>
      ) : (
        <div className="administrator-projects__layout">
          <section
            className="administrator-projects__list"
            aria-label="Administrative project list"
          >
            <h2>All projects</h2>
            {administration.projects.length === 0 ? (
              <p>No projects are available.</p>
            ) : (
              administration.projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={[
                    "administrator-projects__project-button",
                    project.id === selectedProjectId
                      ? "administrator-projects__project-button--selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <span>{project.name}</span>
                  <span>{project.requirementCount} requirements</span>
                </button>
              ))
            )}
          </section>

          {selectedProject === undefined ? (
            <section className="administrator-projects__details">
              <p>Select a project to manage its administration settings.</p>
            </section>
          ) : (
            <div>
              <section
                className="administrator-projects__details"
                aria-labelledby="administrator-project-title"
              >
                <div className="administrator-projects__header">
                  <h2 id="administrator-project-title">
                    {selectedProject.name}
                  </h2>
                  <div className="administrator-projects__toolbar">
                    <Button
                      type="button"
                      label="Rename project"
                      outlined
                      disabled={administration.mutationPending}
                      onClick={() =>
                        setProjectDialog({
                          mode: "rename",
                          project: selectedProject,
                        })
                      }
                    />
                    <Button
                      type="button"
                      label="Delete project"
                      severity="danger"
                      outlined
                      disabled={administration.mutationPending}
                      onClick={() => setDeleteProject(selectedProject)}
                    />
                  </div>
                </div>

                <ProjectSummary project={selectedProject} />

                <div className="administrator-projects__settings">
                  <label htmlFor="administrator-ticket-url-template">
                    Ticket URL template
                  </label>
                  <input
                    id="administrator-ticket-url-template"
                    type="text"
                    value={ticketUrlTemplate}
                    disabled={administration.mutationPending}
                    placeholder="https://tracker.example/tickets/{ticket-id}"
                    onChange={(event) =>
                      setTicketUrlTemplate(event.currentTarget.value)
                    }
                  />
                  <div className="administrator-projects__settings-actions">
                    <Button
                      type="button"
                      label="Save settings"
                      disabled={administration.mutationPending}
                      onClick={() => void saveTicketUrlTemplate()}
                    />
                  </div>
                </div>
              </section>

              <MembershipAdministration
                project={selectedProject}
                users={administration.users}
                pending={administration.mutationPending}
                usersLoading={administration.usersLoading}
                onAdd={(userId) =>
                  administration.addMembership({
                    projectId: selectedProject.id,
                    userId,
                  })
                }
                onRemove={(userId) =>
                  administration.removeMembership({
                    projectId: selectedProject.id,
                    userId,
                  })
                }
              />
            </div>
          )}
        </div>
      )}

      {administration.usersError && (
        <p role="alert" className="administrator-projects__error">
          Users could not be loaded; project memberships cannot be changed.
        </p>
      )}
      {administration.mutationError && (
        <p role="alert" className="administrator-projects__error">
          The project administration change could not be completed.
        </p>
      )}

      <ProjectDialog
        visible={projectDialog !== undefined}
        mode={projectDialog?.mode ?? "create"}
        initialName={
          projectDialog?.mode === "rename" ? projectDialog.project.name : ""
        }
        pending={administration.mutationPending}
        onCancel={() => setProjectDialog(undefined)}
        onSubmit={({ name }) => submitProjectName(name)}
      />

      <Dialog
        visible={deleteProject !== undefined}
        modal
        header="Delete project"
        onHide={() => setDeleteProject(undefined)}
      >
        <p>
          Delete <strong>{deleteProject?.name}</strong>? This action cannot be
          undone.
        </p>
        <div className="administrator-projects__toolbar">
          <Button
            type="button"
            label="Cancel"
            outlined
            disabled={administration.mutationPending}
            onClick={() => setDeleteProject(undefined)}
          />
          <Button
            type="button"
            label="Delete"
            severity="danger"
            disabled={administration.mutationPending}
            onClick={() => void confirmDelete()}
          />
        </div>
      </Dialog>
    </section>
  );
}
