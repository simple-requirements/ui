import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useUserAdministration } from '@/pages/Administration/useUserAdministration';

const mocks = vi.hoisted(() => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    updateUserRole: vi.fn(),
    invalidateQueries: vi.fn(),
    showToastMessage: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({ useQuery: mocks.useQuery, useMutation: mocks.useMutation }));
vi.mock('@/api/authApi', () => ({
    listUsers: vi.fn(),
    revokeAllUserSessions: vi.fn(),
    updateUserRole: mocks.updateUserRole,
    updateUserStatus: vi.fn(),
}));
vi.mock('@/api/queryClient', () => ({ queryClient: { invalidateQueries: mocks.invalidateQueries } }));
vi.mock('@/components/Feedback/toastEvents', () => ({ showToastMessage: mocks.showToastMessage }));

function mutationState(overrides: Record<string, unknown> = {}) {
    return { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, ...overrides };
}

afterEach(() => vi.clearAllMocks());

describe('useUserAdministration', () => {
    it('returns user query state and the three administration mutation APIs', () => {
        mocks.useQuery.mockReturnValue({ data: [{ id: 'user-1' }], isLoading: false, isError: false });
        const role = mutationState();
        const status = mutationState();
        const revoke = mutationState();
        mocks.useMutation.mockReturnValueOnce(role).mockReturnValueOnce(status).mockReturnValueOnce(revoke);

        const { result } = renderHook(() => useUserAdministration());

        expect(result.current.users).toEqual([{ id: 'user-1' }]);
        expect(result.current.changeRole).toBe(role.mutate);
        expect(result.current.changeStatusAsync).toBe(status.mutateAsync);
        expect(result.current.revokeAllSessions).toBe(revoke.mutate);
        expect(result.current.mutationPending).toBe(false);
    });

    it('updates a role, refreshes the user query, and publishes a success toast', async () => {
        const mutationOptions: unknown[] = [];
        const updatedUser = {
            id: 'user-1',
            username: 'one',
            email: 'one@example.org',
            displayName: 'One',
            status: 'active' as const,
            role: 'developer' as const,
            emailVerifiedAt: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
        };
        mocks.useQuery.mockReturnValue({ data: [updatedUser], isLoading: false, isError: false });
        mocks.useMutation.mockImplementation((options: unknown) => {
            mutationOptions.push(options);
            return mutationState();
        });
        mocks.updateUserRole.mockResolvedValue({ data: updatedUser, status: 200, headers: new Headers() });
        mocks.invalidateQueries.mockResolvedValue(undefined);

        renderHook(() => useUserAdministration());

        const roleOptions = mutationOptions[0] as Readonly<{
            mutationFn: (
                variables: Readonly<{ user: typeof updatedUser; role: 'developer' }>,
            ) => Promise<typeof updatedUser>;
            onSuccess: (user: typeof updatedUser) => Promise<void>;
        }>;
        const result = await roleOptions.mutationFn({ user: updatedUser, role: 'developer' });
        await roleOptions.onSuccess(result);

        expect(mocks.updateUserRole).toHaveBeenCalledWith('user-1', 'developer');
        expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['administration', 'users'] });
        expect(mocks.showToastMessage).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'success', summary: 'Account role updated', detail: 'One' }),
        );
    });

    it('reports pending state when any user mutation is pending', () => {
        mocks.useQuery.mockReturnValue({ data: undefined, isLoading: true, isError: true });
        mocks.useMutation
            .mockReturnValueOnce(mutationState())
            .mockReturnValueOnce(mutationState({ isPending: true }))
            .mockReturnValueOnce(mutationState());

        const { result } = renderHook(() => useUserAdministration());

        expect(result.current.users).toEqual([]);
        expect(result.current.usersLoading).toBe(true);
        expect(result.current.usersError).toBe(true);
        expect(result.current.mutationPending).toBe(true);
    });
});
