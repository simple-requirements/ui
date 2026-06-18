const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

/** Returns the configured backend origin used to execute Orval-generated relative fetch functions. */
export function getApiBaseUrl() {
    if (!API_BASE_URL)
        throw new Error('Missing VITE_API_BASE_URL. Configure the backend API base URL before starting the UI.');
    try {
        return new URL(API_BASE_URL).toString().replace(/\/$/, '');
    } catch {
        throw new Error('VITE_API_BASE_URL must be a valid absolute URL.');
    }
}

function toBackendRequest(input: RequestInfo | URL): RequestInfo | URL {
    if (typeof input !== 'string' || input.startsWith('http://') || input.startsWith('https://')) return input;
    return `${getApiBaseUrl()}${input}`;
}

/** Runs an Orval-generated fetch function against the configured backend base URL. */
export async function runOrvalFetch<T>(operation: () => Promise<T>): Promise<T> {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (input, init) => originalFetch(toBackendRequest(input), init);
    try {
        return await operation();
    } finally {
        globalThis.fetch = originalFetch;
    }
}
