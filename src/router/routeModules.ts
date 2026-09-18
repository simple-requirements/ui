/** Lazy route modules keep route matching metadata eager while deferring page code until navigation. */
export async function loadAuthenticationEntryRoute() {
    const { AuthenticationEntryPage } = await import('@/pages/AuthenticationEntryPage/AuthenticationEntryPage');

    return { Component: AuthenticationEntryPage };
}

export async function loadRegistrationRoute() {
    const { RegistrationPage } = await import('@/pages/RegistrationPage/RegistrationPage');

    return { Component: RegistrationPage };
}

export async function loadEmailVerificationRoute() {
    const { EmailVerificationPage } = await import('@/pages/EmailVerificationPage/EmailVerificationPage');

    return { Component: EmailVerificationPage };
}

export async function loadResendEmailVerificationRoute() {
    const { ResendEmailVerificationPage } = await import('@/pages/EmailVerificationPage/ResendEmailVerificationPage');

    return { Component: ResendEmailVerificationPage };
}

export async function loadPasswordResetRequestRoute() {
    const { PasswordResetRequestPage } = await import('@/pages/PasswordResetPage/PasswordResetRequestPage');

    return { Component: PasswordResetRequestPage };
}

export async function loadPasswordResetConfirmationRoute() {
    const { PasswordResetConfirmationPage } = await import('@/pages/PasswordResetPage/PasswordResetConfirmationPage');

    return { Component: PasswordResetConfirmationPage };
}

export async function loadWorkspaceRoute() {
    const { WorkspacePage } = await import('@/pages/WorkspacePage');

    return { Component: WorkspacePage };
}

export async function loadUserAdministrationRoute() {
    const { UserAdministrationPage } = await import('@/pages/Administration/UserAdministrationPage');

    return { Component: UserAdministrationPage };
}

export async function loadAdministratorProjectsRoute() {
    const { AdministratorProjectsPage } = await import('@/pages/Administration/AdministratorProjectsPage');

    return { Component: AdministratorProjectsPage };
}

export async function loadProjectDetailsRoute() {
    const { ProjectDetailsPage } = await import('@/pages/ProjectDetails/ProjectDetailsPage');

    return { Component: ProjectDetailsPage };
}

export async function loadProjectRequirementsListRoute() {
    const { ListPage } = await import('@/pages/ProjectRequirements/List/ListPage');

    return { Component: ListPage };
}

export async function loadProjectRequirementsFormRoute() {
    const { FormPage } = await import('@/pages/ProjectRequirements/Form/FormPage');

    return { Component: FormPage };
}

export async function loadProjectRequirementReviewRoute() {
    const { ReviewPage } = await import('@/pages/ProjectRequirements/Review/ReviewPage');

    return { Component: ReviewPage };
}

export async function loadProjectRequirementDetailsRoute() {
    const { DetailsPage } = await import('@/pages/ProjectRequirements/DetailsPage');

    return { Component: DetailsPage };
}

export async function loadProjectCategoriesListRoute() {
    const { ListPage } = await import('@/pages/ProjectCategories/List/ListPage');

    return { Component: ListPage };
}

export async function loadProjectCategoriesFormRoute() {
    const { FormPage } = await import('@/pages/ProjectCategories/Form/FormPage');

    return { Component: FormPage };
}

export async function loadProjectCategoryDetailsRoute() {
    const { DetailsPage } = await import('@/pages/ProjectCategories/DetailsPage');

    return { Component: DetailsPage };
}

function preloadRoute(loadRoute: () => Promise<unknown>): void {
    void loadRoute().catch(() => undefined);
}

/** Starts loading the project overview route code without surfacing speculative-load failures. */
export function preloadProjectDetailsRoute(): void {
    preloadRoute(loadProjectDetailsRoute);
}

/** Starts loading the requirements list route code on navigation intent. */
export function preloadProjectRequirementsListRoute(): void {
    preloadRoute(loadProjectRequirementsListRoute);
}

/** Starts loading the categories list route code on navigation intent. */
export function preloadProjectCategoriesListRoute(): void {
    preloadRoute(loadProjectCategoriesListRoute);
}

/** Starts loading the Administrator users route code on navigation intent. */
export function preloadUserAdministrationRoute(): void {
    preloadRoute(loadUserAdministrationRoute);
}

/** Starts loading the Administrator projects route code on navigation intent. */
export function preloadAdministratorProjectsRoute(): void {
    preloadRoute(loadAdministratorProjectsRoute);
}
