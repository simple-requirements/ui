import { RootLayout } from '@/pages/RootLayout';
import { ProjectCategoriesPage } from '@/pages/ProjectCategoriesPage';
import { ProjectOverviewPage } from '@/pages/ProjectOverviewPage';
import { ProjectRequirementsPage } from '@/pages/ProjectRequirementsPage';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { createBrowserRouter, type RouteObject } from 'react-router';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <WorkspacePage />,
            },
            {
                path: 'projects/:projectId',
                element: <ProjectOverviewPage />,
            },
            {
                path: 'projects/:projectId/requirements',
                element: <ProjectRequirementsPage />,
            },
            {
                path: 'projects/:projectId/categories',
                element: <ProjectCategoriesPage />,
            },
        ],
    },
];

export const router = createBrowserRouter(routes);