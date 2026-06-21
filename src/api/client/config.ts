/** Returns the configured backend origin used to execute backend API requests. */
export function getApiBaseUrl() {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (!apiBaseUrl) throw new Error('The backend connection is not configured. Please contact your administrator.');
    try {
        return new URL(apiBaseUrl).toString().replace(/\/$/, '');
    } catch {
        throw new Error('The backend connection configuration is invalid. Please contact your administrator.');
    }
}

function toBackendRequest(input: RequestInfo | URL): RequestInfo | URL {
    if (typeof input !== 'string' || input.startsWith('http://') || input.startsWith('https://')) return input;
    return `${getApiBaseUrl()}${input}`;
}

/** Runs an Orval-generated fetch function against the configured backend base URL when the generated module is importable. */
export async function runOrvalFetch<T>(operation: () => Promise<T>): Promise<T> {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (input, init) => originalFetch(toBackendRequest(input), init);
    try {
        return await operation();
    } finally {
        globalThis.fetch = originalFetch;
    }
}

/** Fetches typed JSON for endpoint modules that cannot yet be imported from generated Orval output. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(toBackendRequest(path), init);
    const body = [204, 205, 304].includes(response.status) ? '' : await response.text();
    if (!response.ok) {
        const error = new Error(response.statusText || 'Request failed') as Error & { status?: number; info?: unknown };
        error.status = response.status;
        error.info = body ? (JSON.parse(body) as unknown) : undefined;
        throw error;
    }
    return (body ? JSON.parse(body) : null) as T;
}
