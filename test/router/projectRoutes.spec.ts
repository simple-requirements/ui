import { describe, expect, it } from 'vitest';

import {
    getProjectCategoriesRoute,
    getProjectCategoryCreateRoute,
    getProjectCategoryDetailsCloseRoute,
    getProjectCategoryDetailsRoute,
    getProjectCategoryEditRoute,
    getProjectRequirementDetailsCloseRoute,
    getProjectRequirementDetailsRoute,
    getProjectRequirementsRoute,
    getProjectRoute,
} from '@/router/projectRoutes';

describe('projectRoutes', () => {
    it('builds project routes.', () => {
        expect(getProjectRoute('project-alpha')).toBe('/projects/project-alpha');
        expect(getProjectRequirementsRoute('project-alpha')).toBe('/projects/project-alpha/requirements');
        expect(getProjectRequirementDetailsRoute('project-alpha', 'requirement-auth')).toBe(
            '/projects/project-alpha/requirements/requirement-auth',
        );
        expect(getProjectCategoriesRoute('project-alpha')).toBe('/projects/project-alpha/categories');
        expect(getProjectCategoryCreateRoute('project-alpha')).toBe('/projects/project-alpha/categories/new');
        expect(getProjectCategoryDetailsRoute('project-alpha', 'category-auth')).toBe(
            '/projects/project-alpha/categories/category-auth',
        );
        expect(getProjectCategoryEditRoute('project-alpha', 'category-auth')).toBe(
            '/projects/project-alpha/categories/category-auth/edit',
        );
    });

    it('derives the close route from category detail and form routes.', () => {
        expect(getProjectCategoryDetailsCloseRoute('/projects/project-alpha/categories/category-auth')).toBe(
            '/projects/project-alpha/categories',
        );
        expect(getProjectCategoryDetailsCloseRoute('/projects/project-alpha/categories/new')).toBe(
            '/projects/project-alpha/categories',
        );
        expect(getProjectCategoryDetailsCloseRoute('/projects/project-alpha/categories/category-auth/edit')).toBe(
            '/projects/project-alpha/categories',
        );
    });

    it('derives the close route from requirement details routes.', () => {
        expect(getProjectRequirementDetailsCloseRoute('/projects/project-alpha/requirements/requirement-auth')).toBe(
            '/projects/project-alpha/requirements',
        );
    });

    it('returns undefined for list routes.', () => {
        expect(getProjectCategoryDetailsCloseRoute('/projects/project-alpha/categories')).toBeUndefined();
        expect(getProjectRequirementDetailsCloseRoute('/projects/project-alpha/requirements')).toBeUndefined();
    });
});
