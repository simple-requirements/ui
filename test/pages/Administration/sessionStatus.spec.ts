import { describe, expect, it } from 'vitest';

import type { SessionResponse } from '@/api/authApi';
import { isSessionActive } from '@/pages/Administration/sessionStatus';

const now = Date.parse('2026-09-21T12:00:00.000Z');

function session(lastActivityAt: string, revokedAt: string | null = null): SessionResponse {
    return { id: 'session-1', createdAt: '2026-09-21T10:00:00.000Z', lastActivityAt, revokedAt };
}

describe('isSessionActive', () => {
    it('treats an unrevoked session inside the inactivity window as active', () => {
        expect(isSessionActive(session('2026-09-21T11:30:00.000Z'), now)).toBe(true);
    });

    it('treats a revoked or timed-out session as inactive', () => {
        expect(isSessionActive(session('2026-09-21T11:30:00.000Z', '2026-09-21T11:45:00.000Z'), now)).toBe(false);
        expect(isSessionActive(session('2026-09-21T11:00:00.000Z'), now)).toBe(false);
    });
});
