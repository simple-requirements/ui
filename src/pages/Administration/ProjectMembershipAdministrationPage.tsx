import { useState } from "react";

import { LoadableContent } from "@/components/Feedback/LoadableContent";
import { AdministrationNavigation } from "@/pages/Administration/AdministrationNavigation";
import { ProjectMemberships } from "@/pages/Administration/ProjectMemberships";
import { useProjectMembershipAdministration } from "@/pages/Administration/useProjectMembershipAdministration";

import "@/pages/Administration/ProjectMembershipAdministrationPage.scss";

export function ProjectMembershipAdministrationPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const administration =
    useProjectMembershipAdministration(selectedProjectId);
  const selectedProject = administration.projects.find(
    (project) => project.id === selectedProjectId,
  );

  return (
    <section
      className="project-membership-administration"
      aria-labelledby="project-membership-administration-title"
    >
      <header>
        <p className="project-membership-administration__eyebrow">
          Administration
        </p>
        <h1 id="project-membership-administration-title">
          Project memberships
        </h1>
        <AdministrationNavigation />
      </header>

      <LoadableContent
        loading={administration.projectsLoading}
        error={administration.projectsError}
        empty={administration.projects.length === 0}
        loadingMessage="Loading projects …"
        errorMessage="Projects could not be loaded."
        emptyMessage="No projects are available."
      >
        <div className="project-membership-administration__project-picker">
          <label htmlFor="administration-project">Project</label>
          <select
            id="administration-project"
            value={selectedProjectId ?? ""}
            onChange={(event) =>
              setSelectedProjectId(event.target.value || undefined)
            }
          >
            <option value="">Select a project</option>
            {administration.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProject === undefined ? (
          <p className="project-membership-administration__selection">
            Select a project to view and manage its memberships.
          </p>
        ) : (
          <LoadableContent
            loading={
              administration.usersLoading || administration.membershipsLoading
            }
            error={administration.usersError || administration.membershipsError}
            loadingMessage="Loading project memberships …"
            errorMessage="Project memberships could not be loaded."
          >
            <ProjectMemberships
              key={selectedProject.id}
              projectName={selectedProject.name}
              users={administration.users}
              memberships={administration.memberships}
              pending={administration.mutationPending}
              onSetMembership={(userId, displayName, roles) =>
                administration.setMembership({
                  projectId: selectedProject.id,
                  userId,
                  displayName,
                  roles,
                })
              }
              onRemoveMembership={(userId, displayName) =>
                administration.removeMembership({
                  projectId: selectedProject.id,
                  userId,
                  displayName,
                })
              }
            />
          </LoadableContent>
        )}
      </LoadableContent>
    </section>
  );
}
