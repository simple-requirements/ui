import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as ReactQueryModule from '@tanstack/react-query';

import type { UserAdministrationResponse } from '@/api/authApi';
import { useUserPresence } from '@/pages/Administration/useUserPresence';

const mocks = vi.hoisted(() => ({ useQueries: vi.fn(), isSessionActive: vi.fn() }));

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = await importOriginal<typeof ReactQueryModule>();

    return { ...actual, useQueries: mocks.useQueries };
});
vi.mock('@/pages/Administration/sessionStatus', () => ({ isSessionActive: mocks.isSessionActive }));

const users: UserAdministrationResponse[] = [
    {
        id: 'user-1',
        username: 'one',
        email: 'one@example.org',
        displayName: 'One',
        status: 'active',
        role: 'viewer',
        emailVerifiedAt: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'user-2',
        username: 'two',
        email: 'two@example.org',
        displayName: 'Two',
        status: 'active',
        role: 'developer',
        emailVerifiedAt: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    },
];

afterEach(() => vi.clearAllMocks());

describe('useUserPresence', () => {
    it('maps per-user session query state to presence information', () => {
        mocks.useQueries.mockReturnValue([
            { data: [{ id: 's1' }, { id: 's2' }], isLoading: false, isError: false },
            { data: [], isLoading: true, isError: true },
        ]);
        mocks.isSessionActive.mockImplementation((session: Readonly<{ id: string }>) => session.id === 's1');

        const { result } = renderHook(() => useUserPresence(users));

        expect(result.current.get('user-1')).toEqual({
            active: true,
            activeSessionCount: 1,
            loading: false,
            error: false,
        });
        expect(result.current.get('user-2')).toEqual({
            active: false,
            activeSessionCount: 0,
            loading: true,
            error: true,
        });
    });
});
