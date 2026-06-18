import { mapApiError } from '@/api/errors/apiError';

const internalDetailPattern = /\b(?:VITE_[A-Z0-9_]*|https?:\/\/\S+|Error:|DOMException|TypeError|stack trace)\b/i;

export interface UserSafeErrorMessage {
    message: string;
    retryable: boolean;
}

export function mapRevisionHistoryError(error: unknown): UserSafeErrorMessage {
    const mapped = mapApiError(error);
    const rawMessage = error instanceof Error ? error.message : mapped.message;
    if (internalDetailPattern.test(rawMessage)) {
        console.error('Revision history failed with internal diagnostic:', error);
        return { message: 'Revision history is currently unavailable. Please try again later.', retryable: false };
    }
    if (mapped.kind === 'network' || mapped.kind === 'aborted') {
        return { message: 'Revision history is currently unavailable. Please try again later.', retryable: true };
    }
    return {
        message: 'Revision history is currently unavailable. Please try again later.',
        retryable: mapped.kind !== 'unexpected',
    };
}
