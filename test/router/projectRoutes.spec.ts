import { describe, expect, it } from 'vitest';

import {
    getProjectCategoriesRoute,
    getProjectCategoryDetailsCloseRoute,
    getProjectCategoryDetailsRoute,
    getProjectRequirementsRoute,
    getProjectRoute,
} from '@/router/projectRoutes';

describe('projectRoutes', () => {
    it('builds project routes.', () => {
        expect(getProjectRoute('project-alpha')).toBe('/projects/project-alpha');
        expect(getProjectRequirementsRoute('project-alpha')).toBe('/projects/project-alpha/requirements');
        expect(getProjectCategoriesRoute('project-alpha')).toBe('/projects/project-alpha/categories');
        expect(getProjectCategoryDetailsRoute('project-alpha', 'category-auth')).toBe(
            '/projects/project-alpha/categories/category-auth',
        );
    });

    it('derives the close route from a category details route.', () => {
        expect(getProjectCategoryDetailsCloseRoute('/projects/project-alpha/categories/category-auth')).toBe(
            '/projects/project-alpha/categories',
        );
    });

    it('returns undefined for non-category details routes.', () => {
        expect(getProjectCategoryDetailsCloseRoute('/projects/project-alpha/categories')).toBeUndefined();
        expect(getProjectCategoryDetailsCloseRoute('/projects/project-alpha/requirements')).toBeUndefined();
    });
});
