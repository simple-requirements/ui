import { describe, expect, it } from 'vitest';

import {
    getActiveAdministratorSection,
    getAdministratorProjectRoute,
    getAdministratorUserRoute,
} from '@/router/administrationRoutes';

describe('administrationRoutes', () => {
    it('builds Administrator detail routes.', () => {
        expect(getAdministratorUserRoute('user/one')).toBe('/admin/users/user%2Fone');
        expect(getAdministratorProjectRoute('project/one')).toBe('/admin/projects/project%2Fone');
    });

    it('resolves the active Administrator section.', () => {
        expect(getActiveAdministratorSection('/admin/users')).toBe('users');
        expect(getActiveAdministratorSection('/admin/users/user-one')).toBe('users');
        expect(getActiveAdministratorSection('/admin/projects')).toBe('projects');
        expect(getActiveAdministratorSection('/admin/projects/project-one')).toBe('projects');
        expect(getActiveAdministratorSection('/')).toBeUndefined();
    });
});
