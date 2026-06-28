export function getApiBaseUrl(): string {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    if (typeof apiBaseUrl === 'string' && apiBaseUrl.trim().length > 0) {
        return apiBaseUrl.replace(/\/$/, '');
    }

    return 'http://localhost:3000';
}
