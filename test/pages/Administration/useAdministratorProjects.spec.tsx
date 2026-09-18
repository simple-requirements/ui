import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAdministratorProjects } from '@/pages/Administration/useAdministratorProjects';

const mocks = vi.hoisted(() => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    createAdministratorProject: vi.fn(),
    invalidateQueries: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({ useQuery: mocks.useQuery, useMutation: mocks.useMutation }));
vi.mock('@/api/adminProjectsApi', () => ({
    createAdministratorProject: mocks.createAdministratorProject,
    deleteAdministratorProject: vi.fn(),
    listAdministratorProjects: vi.fn(),
    updateAdministratorProject: vi.fn(),
}));
vi.mock('@/api/authApi', () => ({
    listUsers: vi.fn(),
    removeProjectMembership: vi.fn(),
    setProjectMembership: vi.fn(),
}));
vi.mock('@/api/queryClient', () => ({ queryClient: { invalidateQueries: mocks.invalidateQueries } }));

function mutationState(overrides: Record<string, unknown> = {}) {
    return { mutateAsync: vi.fn(), isPending: false, isError: false, ...overrides };
}

afterEach(() => vi.clearAllMocks());

describe('useAdministratorProjects', () => {
    it('returns loaded project/user data and exposes mutation functions', () => {
        mocks.useQuery
            .mockReturnValueOnce({ data: [{ id: 'project-1' }], isLoading: false, isError: false })
            .mockReturnValueOnce({ data: [{ id: 'user-1' }], isLoading: false, isError: false });
        const mutations = [mutationState(), mutationState(), mutationState(), mutationState(), mutationState()];
        mutations.forEach((mutation) => mocks.useMutation.mockReturnValueOnce(mutation));

        const { result } = renderHook(() => useAdministratorProjects());

        expect(result.current.projects).toEqual([{ id: 'project-1' }]);
        expect(result.current.users).toEqual([{ id: 'user-1' }]);
        expect(result.current.createProject).toBe(mutations[0].mutateAsync);
        expect(result.current.removeMembership).toBe(mutations[4].mutateAsync);
        expect(result.current.mutationPending).toBe(false);
        expect(result.current.mutationError).toBe(false);
    });

    it('wires project creation to the API and refreshes the administrator project query', async () => {
        const mutationOptions: unknown[] = [];
        mocks.useQuery.mockReturnValue({ data: [], isLoading: false, isError: false });
        mocks.useMutation.mockImplementation((options: unknown) => {
            mutationOptions.push(options);
            return mutationState();
        });
        mocks.createAdministratorProject.mockResolvedValue({ id: 'project-1', name: 'Alpha' });
        mocks.invalidateQueries.mockResolvedValue(undefined);

        renderHook(() => useAdministratorProjects());

        const createOptions = mutationOptions[0] as Readonly<{
            mutationFn: (name: string) => Promise<unknown>;
            onSuccess: () => Promise<void>;
        }>;
        await createOptions.mutationFn('Alpha');
        await createOptions.onSuccess();

        expect(mocks.createAdministratorProject).toHaveBeenCalledWith('Alpha');
        expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['administration', 'projects'] });
    });

    it('aggregates loading, mutation pending, and mutation error state', () => {
        mocks.useQuery
            .mockReturnValueOnce({ data: undefined, isLoading: true, isError: true })
            .mockReturnValueOnce({ data: undefined, isLoading: true, isError: true });
        [
            mutationState({ isPending: true }),
            mutationState(),
            mutationState({ isError: true }),
            mutationState(),
            mutationState(),
        ].forEach((mutation) => mocks.useMutation.mockReturnValueOnce(mutation));

        const { result } = renderHook(() => useAdministratorProjects());

        expect(result.current.projects).toEqual([]);
        expect(result.current.users).toEqual([]);
        expect(result.current.projectsLoading).toBe(true);
        expect(result.current.usersError).toBe(true);
        expect(result.current.mutationPending).toBe(true);
        expect(result.current.mutationError).toBe(true);
    });
});
