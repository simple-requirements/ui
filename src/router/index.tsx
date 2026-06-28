import { RootLayout } from '@/pages/RootLayout';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { createBrowserRouter, type RouteObject } from 'react-router';

export const routes: RouteObject[] = [
    { path: '/', element: <RootLayout />, children: [{ index: true, element: <WorkspacePage /> }] },
];

export const router = createBrowserRouter(routes);
