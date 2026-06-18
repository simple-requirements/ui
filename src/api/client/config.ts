const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
export function getApiBaseUrl() {
    if (!API_BASE_URL)
        throw new Error('Missing VITE_API_BASE_URL. Configure the backend API base URL before starting the UI.');
    try {
        return new URL(API_BASE_URL).toString().replace(/\/$/, '');
    } catch {
        throw new Error('VITE_API_BASE_URL must be a valid absolute URL.');
    }
}
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${getApiBaseUrl()}${path}`, init);
    const body = [204, 205, 304].includes(response.status) ? '' : await response.text();
    if (!response.ok) {
        const error = new Error(response.statusText || 'Request failed') as Error & { status?: number; info?: unknown };
        error.status = response.status;
        error.info = body ? (JSON.parse(body) as unknown) : undefined;
        throw error;
    }
    return (body ? JSON.parse(body) : null) as T;
}
