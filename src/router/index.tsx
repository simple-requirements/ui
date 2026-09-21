import { RootLayout } from '@/pages/RootLayout';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AdministratorRoute } from '@/auth/AdministratorRoute';
import { ProjectPermissionRoute } from '@/auth/ProjectPermissionRoute';
import { projectPermissionKinds } from '@/auth/projectPermissions';
import { createBrowserRouter, type RouteObject } from 'react-router';

import { WORKSPACE_ROUTE } from '@/router/applicationRoutes';
import {
    EMAIL_VERIFICATION_ROUTE,
    FORGOT_PASSWORD_ROUTE,
    LOGIN_ROUTE,
    REGISTRATION_ROUTE,
    RESEND_EMAIL_VERIFICATION_ROUTE,
    RESET_PASSWORD_ROUTE,
} from '@/router/authenticationRoutes';
import type { RouteUiHandle } from '@/router/routeUiMetadata';
import {
    loadAdministratorProjectsRoute,
    loadAuthenticationEntryRoute,
    loadEmailVerificationRoute,
    loadPasswordResetConfirmationRoute,
    loadPasswordResetRequestRoute,
    loadProjectCategoriesFormRoute,
    loadProjectCategoriesListRoute,
    loadProjectCategoryDetailsRoute,
    loadProjectDetailsRoute,
    loadProjectRequirementDetailsRoute,
    loadProjectRequirementReviewRoute,
    loadProjectRequirementsFormRoute,
    loadProjectRequirementsListRoute,
    loadRegistrationRoute,
    loadResendEmailVerificationRoute,
    loadUserAdministrationRoute,
    loadWorkspaceRoute,
} from '@/router/routeModules';

function routeHandle(handle: RouteUiHandle): RouteUiHandle {
    return handle;
}

export const routes: RouteObject[] = [
    { path: LOGIN_ROUTE, lazy: loadAuthenticationEntryRoute },
    { path: REGISTRATION_ROUTE, lazy: loadRegistrationRoute },
    { path: EMAIL_VERIFICATION_ROUTE, lazy: loadEmailVerificationRoute },
    { path: RESEND_EMAIL_VERIFICATION_ROUTE, lazy: loadResendEmailVerificationRoute },
    { path: FORGOT_PASSWORD_ROUTE, lazy: loadPasswordResetRequestRoute },
    { path: RESET_PASSWORD_ROUTE, lazy: loadPasswordResetConfirmationRoute },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: WORKSPACE_ROUTE,
                element: <RootLayout />,
                handle: routeHandle({ actionBar: 'none' }),
                children: [
                    { index: true, lazy: loadWorkspaceRoute },
                    {
                        element: <AdministratorRoute />,
                        children: [
                            {
                                path: 'admin/users/:userId?',
                                lazy: loadUserAdministrationRoute,
                                handle: routeHandle({ actionBar: 'administratorUsers' }),
                            },
                            {
                                path: 'admin/projects/:projectId?',
                                lazy: loadAdministratorProjectsRoute,
                                handle: routeHandle({ actionBar: 'administratorProjects' }),
                            },
                        ],
                    },
                    {
                        element: <ProjectPermissionRoute permission={projectPermissionKinds.read} />,
                        children: [
                            {
                                path: 'projects/:projectId',
                                handle: routeHandle({ actionBar: 'project' }),
                                children: [
                                    { index: true, lazy: loadProjectDetailsRoute },
                                    {
                                        path: 'requirements',
                                        handle: routeHandle({ actionBar: 'requirementDetails' }),
                                        children: [
                                            {
                                                index: true,
                                                lazy: loadProjectRequirementsListRoute,
                                                handle: routeHandle({ actionBar: 'requirements' }),
                                            },
                                            {
                                                element: (
                                                    <ProjectPermissionRoute
                                                        permission={projectPermissionKinds.manageRequirements}
                                                    />
                                                ),
                                                children: [
                                                    {
                                                        path: 'new',
                                                        lazy: loadProjectRequirementsFormRoute,
                                                        handle: routeHandle({
                                                            actionBar: 'requirementForm',
                                                            disableChromeActions: true,
                                                        }),
                                                    },
                                                    {
                                                        path: ':requirementId/edit',
                                                        lazy: loadProjectRequirementsFormRoute,
                                                        handle: routeHandle({
                                                            actionBar: 'requirementForm',
                                                            disableChromeActions: true,
                                                        }),
                                                    },
                                                ],
                                            },
                                            {
                                                path: ':requirementId/review',
                                                lazy: loadProjectRequirementReviewRoute,
                                                handle: routeHandle({ actionBar: 'review' }),
                                            },
                                            { path: ':requirementId', lazy: loadProjectRequirementDetailsRoute },
                                        ],
                                    },
                                    {
                                        path: 'categories',
                                        handle: routeHandle({ actionBar: 'categories' }),
                                        children: [
                                            { index: true, lazy: loadProjectCategoriesListRoute },
                                            {
                                                element: (
                                                    <ProjectPermissionRoute
                                                        permission={projectPermissionKinds.manageRequirements}
                                                    />
                                                ),
                                                children: [
                                                    {
                                                        path: 'new',
                                                        lazy: loadProjectCategoriesFormRoute,
                                                        handle: routeHandle({
                                                            actionBar: 'categoryForm',
                                                            disableChromeActions: true,
                                                        }),
                                                    },
                                                    {
                                                        path: ':categoryId/edit',
                                                        lazy: loadProjectCategoriesFormRoute,
                                                        handle: routeHandle({
                                                            actionBar: 'categoryForm',
                                                            disableChromeActions: true,
                                                        }),
                                                    },
                                                ],
                                            },
                                            { path: ':categoryId', lazy: loadProjectCategoryDetailsRoute },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export const router = createBrowserRouter(routes);
