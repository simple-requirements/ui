import { describe, expect, it } from 'vitest';

import { getActiveProjectRoute } from '@/components/RootLayout/Sidebar/useActiveProjectRoute';

describe('getActiveProjectRoute', () => {
    it('detects a project overview route.', () => {
        expect(getActiveProjectRoute('/projects/project-alpha')).toEqual({ projectId: 'project-alpha' });
    });

    it('detects a requirements route.', () => {
        expect(getActiveProjectRoute('/projects/project-alpha/requirements')).toEqual({
            projectId: 'project-alpha',
            subRoute: 'requirements',
        });
    });

    it('detects category routes including nested category detail routes.', () => {
        expect(getActiveProjectRoute('/projects/project-alpha/categories')).toEqual({
            projectId: 'project-alpha',
            subRoute: 'categories',
        });
        expect(getActiveProjectRoute('/projects/project-alpha/categories/category-auth')).toEqual({
            projectId: 'project-alpha',
            subRoute: 'categories',
        });
    });

    it('returns an empty object for non-project routes.', () => {
        expect(getActiveProjectRoute('/')).toEqual({});
    });
});
