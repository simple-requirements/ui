import { eq, useLiveQuery } from "@tanstack/react-db";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";

import { getProjectRequirementsCollection } from "@/api/collections/projectRequirementsCollection";
import { InlineStatus } from "@/components/Feedback/InlineStatus";
import { LoadableContent } from "@/components/Feedback/LoadableContent";
import { getProjectRequirementDetailsRoute } from "@/router/projectRoutes";
import { openTab } from "@/stores/tabBarStore";

import { RequirementDetailsPanel } from "@/pages/ProjectRequirements/RequirementDetailsPanel";

import "@/pages/ProjectRequirements/DetailsPage.scss";

export function DetailsPage() {
  const { projectId, requirementId } = useParams();

  const requirementDetailsRoute =
    projectId === undefined || requirementId === undefined
      ? undefined
      : getProjectRequirementDetailsRoute(projectId, requirementId);

  const requirementsCollection = useMemo(
    () =>
      projectId === undefined
        ? undefined
        : getProjectRequirementsCollection(projectId),
    [projectId],
  );

  const requirementQuery = useLiveQuery(
    (query) => {
      if (requirementsCollection === undefined || requirementId === undefined) {
        return undefined;
      }

      return query
        .from({ requirements: requirementsCollection })
        .where(({ requirements }) => eq(requirements.id, requirementId))
        .findOne();
    },
    [requirementsCollection, requirementId],
  );

  const requirement = requirementQuery.data;

  useEffect(() => {
    if (requirement === undefined || requirementDetailsRoute === undefined) {
      return;
    }

    openTab({
      id: requirementDetailsRoute,
      label: requirement.visibleKey,
      closable: true,
    });
  }, [requirement, requirementDetailsRoute]);

  if (projectId === undefined || requirementId === undefined) {
    return (
      <section className="project-requirements-details-page">
        <InlineStatus kind="error">
          Requirement route is incomplete.
        </InlineStatus>
      </section>
    );
  }

  return (
    <section
      className="project-requirements-details-page"
      aria-labelledby="project-requirements-details-page-title"
    >
      <LoadableContent
        loading={requirementQuery.isLoading}
        error={requirementQuery.isError}
        empty={requirement === undefined}
        loadingMessage="Loading requirement …"
        errorMessage="Requirement could not be loaded."
        emptyMessage="Requirement could not be found in the project requirements list."
      >
        <RequirementDetailsPanel
          requirement={requirement}
          title={
            requirement === undefined
              ? "Requirement details"
              : requirement.visibleKey
          }
          titleElement="h1"
          titleId="project-requirements-details-page-title"
        />
      </LoadableContent>
    </section>
  );
}
