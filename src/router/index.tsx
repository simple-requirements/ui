import { DetailsPage as ProjectCategoriesDetailsPage } from '@/pages/ProjectCategories/DetailsPage';
import { FormPage as ProjectCategoriesFormPage } from '@/pages/ProjectCategories/Form/FormPage';
import { ListPage as ProjectCategoriesListPage } from '@/pages/ProjectCategories/List/ListPage';
import { ProjectOverviewPage } from '@/pages/ProjectOverviewPage';
import { DetailsPage as ProjectRequirementsDetailsPage } from '@/pages/ProjectRequirements/DetailsPage';
import { FormPage as ProjectRequirementsFormPage } from '@/pages/ProjectRequirements/Form/FormPage';
import { ProjectRequirementsPage } from '@/pages/ProjectRequirementsPage';
import { RootLayout } from '@/pages/RootLayout';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { createBrowserRouter, type RouteObject } from 'react-router';

import type { RouteUiHandle } from '@/router/routeUiMetadata';

function routeHandle(handle: RouteUiHandle): RouteUiHandle {
    return handle;
}

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <RootLayout />,
        handle: routeHandle({ actionBar: 'requirements' }),
        children: [
            { index: true, element: <WorkspacePage /> },
            {
                path: 'projects/:projectId',
                handle: routeHandle({ actionBar: 'requirements' }),
                children: [
                    { index: true, element: <ProjectOverviewPage /> },
                    {
                        path: 'requirements',
                        handle: routeHandle({ actionBar: 'requirements' }),
                        children: [
                            { index: true, element: <ProjectRequirementsPage /> },
                            {
                                path: 'new',
                                element: <ProjectRequirementsFormPage />,
                                handle: routeHandle({ actionBar: 'requirementForm', disableChromeActions: true }),
                            },
                            {
                                path: ':requirementId/edit',
                                element: <ProjectRequirementsFormPage />,
                                handle: routeHandle({ actionBar: 'requirementForm', disableChromeActions: true }),
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
                                path: 'new',
                                element: <ProjectCategoriesFormPage />,
                                handle: routeHandle({ actionBar: 'categoryForm', disableChromeActions: true }),
                            },
                            {
                                path: ':categoryId/edit',
                                element: <ProjectCategoriesFormPage />,
                                handle: routeHandle({ actionBar: 'categoryForm', disableChromeActions: true }),
                            },
                            { path: ':categoryId', element: <ProjectCategoriesDetailsPage /> },
                        ],
                    },
                ],
            },
        ],
    },
];

export const router = createBrowserRouter(routes);
