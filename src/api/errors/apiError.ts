export interface MappedApiError {
    kind: 'validation' | 'accessDenied' | 'notFound' | 'conflict' | 'network' | 'aborted' | 'unexpected';
    message: string;
}
const internalDetailPattern =
    /\b(?:VITE_[A-Z0-9_]*|https?:\/\/\S+|Error:|DOMException|TypeError|stack trace|src\/api|openapi|generated)\b/i;

function userSafeMessage(message: string) {
    if (internalDetailPattern.test(message))
        return 'The requested backend data is currently unavailable. Please try again later.';
    return message;
}

function messageFromInfo(info: unknown) {
    if (info && typeof info === 'object' && 'message' in info) {
        const message = (info as { message?: unknown }).message;
        return (
            Array.isArray(message) ? message.join(' ')
            : typeof message === 'string' ? message
            : null
        );
    }
    return null;
}
export function mapApiError(error: unknown): MappedApiError {
    if (error instanceof DOMException && error.name === 'AbortError')
        return { kind: 'aborted', message: 'Request was cancelled.' };
    const status =
        typeof error === 'object' && error && 'status' in error ? (error as { status?: number }).status : undefined;
    const info = typeof error === 'object' && error && 'info' in error ? (error as { info?: unknown }).info : undefined;
    const message =
        messageFromInfo(info)
        ?? (error instanceof Error && error.message ? error.message : 'Unexpected server response.');
    if (status === 400) return { kind: 'validation', message: userSafeMessage(message) };
    if (status === 403) return { kind: 'accessDenied', message: 'Access denied.' };
    if (status === 404) return { kind: 'notFound', message: 'Not found.' };
    if (status === 409) return { kind: 'conflict', message: userSafeMessage(message) };
    if (!status && error instanceof TypeError) return { kind: 'network', message: 'Network request failed.' };
    return { kind: 'unexpected', message: userSafeMessage(message) };
}
