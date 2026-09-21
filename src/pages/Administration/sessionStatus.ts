import type { SessionResponse } from '@/api/authApi';

const SESSION_INACTIVITY_MS = 60 * 60 * 1000;

/**
 * Reports whether a recorded session still represents a currently authenticated login.
 * A session becomes inactive after the backend's one-hour inactivity window even when
 * its revoked timestamp has not yet been persisted by another authenticated request.
 */
export function isSessionActive(session: SessionResponse, now = Date.now()): boolean {
    return session.revokedAt === null && new Date(session.lastActivityAt).getTime() > now - SESSION_INACTIVITY_MS;
}
