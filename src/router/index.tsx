import { RootLayout } from '@/pages/RootLayout';
import { DetailsPage as ProjectCategoriesDetailsPage } from '@/pages/ProjectCategories/DetailsPage';
import { ListPage as ProjectCategoriesListPage } from '@/pages/ProjectCategories/ListPage';
import { ProjectOverviewPage } from '@/pages/ProjectOverviewPage';
import { ProjectRequirementsPage } from '@/pages/ProjectRequirementsPage';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { createBrowserRouter, type RouteObject } from 'react-router';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, element: <WorkspacePage /> },
            { path: 'projects/:projectId', element: <ProjectOverviewPage /> },
            { path: 'projects/:projectId/requirements', element: <ProjectRequirementsPage /> },
            { path: 'projects/:projectId/categories', element: <ProjectCategoriesListPage /> },
            { path: 'projects/:projectId/categories/:categoryId', element: <ProjectCategoriesDetailsPage /> },
        ],
    },
];

export const router = createBrowserRouter(routes);
