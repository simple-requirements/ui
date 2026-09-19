import { DetailsPage as ProjectCategoriesDetailsPage } from '@/pages/ProjectCategories/DetailsPage';
import { FormPage as ProjectCategoriesFormPage } from '@/pages/ProjectCategories/Form/FormPage';
import { ListPage as ProjectCategoriesListPage } from '@/pages/ProjectCategories/List/ListPage';
import { ProjectDetailsPage } from '@/pages/ProjectDetails/ProjectDetailsPage';
import { DetailsPage as ProjectRequirementsDetailsPage } from '@/pages/ProjectRequirements/DetailsPage';
import { FormPage as ProjectRequirementsFormPage } from '@/pages/ProjectRequirements/Form/FormPage';
import { ListPage as ProjectRequirementsListPage } from '@/pages/ProjectRequirements/List/ListPage';
import { ReviewPage as ProjectRequirementReviewPage } from '@/pages/ProjectRequirements/Review/ReviewPage';
import { RootLayout } from '@/pages/RootLayout';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { AuthenticationEntryPage } from '@/pages/AuthenticationEntryPage/AuthenticationEntryPage';
import { EmailVerificationPage } from '@/pages/EmailVerificationPage/EmailVerificationPage';
import { ResendEmailVerificationPage } from '@/pages/EmailVerificationPage/ResendEmailVerificationPage';
import { PasswordResetConfirmationPage } from '@/pages/PasswordResetPage/PasswordResetConfirmationPage';
import { PasswordResetRequestPage } from '@/pages/PasswordResetPage/PasswordResetRequestPage';
import { RegistrationPage } from '@/pages/RegistrationPage/RegistrationPage';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AdministratorRoute } from '@/auth/AdministratorRoute';
import { ProjectPermissionRoute } from '@/auth/ProjectPermissionRoute';
import { projectPermissionKinds } from '@/auth/projectPermissions';
import { AdministratorProjectsPage } from '@/pages/Administration/AdministratorProjectsPage';
import { UserAdministrationPage } from '@/pages/Administration/UserAdministrationPage';
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

function routeHandle(handle: RouteUiHandle): RouteUiHandle {
    return handle;
}

export const routes: RouteObject[] = [
    { path: LOGIN_ROUTE, element: <AuthenticationEntryPage /> },
    { path: REGISTRATION_ROUTE, element: <RegistrationPage /> },
    { path: EMAIL_VERIFICATION_ROUTE, element: <EmailVerificationPage /> },
    { path: RESEND_EMAIL_VERIFICATION_ROUTE, element: <ResendEmailVerificationPage /> },
    { path: FORGOT_PASSWORD_ROUTE, element: <PasswordResetRequestPage /> },
    { path: RESET_PASSWORD_ROUTE, element: <PasswordResetConfirmationPage /> },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: WORKSPACE_ROUTE,
                element: <RootLayout />,
                handle: routeHandle({ actionBar: 'none' }),
                children: [
                    { index: true, element: <WorkspacePage /> },
                    {
                        element: <AdministratorRoute />,
                        children: [
                            {
                                path: 'admin/users/:userId?',
                                element: <UserAdministrationPage />,
                                handle: routeHandle({ actionBar: 'administratorUsers' }),
                            },
                            {
                                path: 'admin/projects/:projectId?',
                                element: <AdministratorProjectsPage />,
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
                                    { index: true, element: <ProjectDetailsPage /> },
                                    {
                                        path: 'requirements',
                                        handle: routeHandle({ actionBar: 'requirementDetails' }),
                                        children: [
                                            {
                                                index: true,
                                                element: <ProjectRequirementsListPage />,
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
                                                        element: <ProjectRequirementsFormPage />,
                                                        handle: routeHandle({
                                                            actionBar: 'requirementForm',
                                                            disableChromeActions: true,
                                                        }),
                                                    },
                                                    {
                                                        path: ':requirementId/edit',
                                                        element: <ProjectRequirementsFormPage />,
                                                        handle: routeHandle({
                                                            actionBar: 'requirementForm',
                                                            disableChromeActions: true,
                                                        }),
                                                    },
                                                ],
                                            },
                                            {
                                                path: ':requirementId/review',
                                                element: <ProjectRequirementReviewPage />,
                                                handle: routeHandle({ actionBar: 'review' }),
                                            },
                                            { path: ':requirementId', element: <ProjectRequirementsDetailsPage /> },
                                        ],
                                    },
                                    {
                                        path: 'categories',
                                        handle: routeHandle({ actionBar: 'categories' }),
                                        children: [
                                            { index: true, element: <ProjectCategoriesListPage /> },
                                            {
                                                element: (
                                                    <ProjectPermissionRoute
                                                        permission={projectPermissionKinds.manageRequirements}
                                                    />
                                                ),
                                                children: [
                                                    {
                                                        path: 'new',
                                                        element: <ProjectCategoriesFormPage />,
                                                        handle: routeHandle({
                                                            actionBar: 'categoryForm',
                                                            disableChromeActions: true,
                                                        }),
                                                    },
                                                    {
                                                        path: ':categoryId/edit',
                                                        element: <ProjectCategoriesFormPage />,
                                                        handle: routeHandle({
                                                            actionBar: 'categoryForm',
                                                            disableChromeActions: true,
                                                        }),
                                                    },
                                                ],
                                            },
                                            { path: ':categoryId', element: <ProjectCategoriesDetailsPage /> },
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
