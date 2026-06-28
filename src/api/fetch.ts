import { getApiBaseUrl } from '@/api/baseUrl';

export class ApiError extends Error {
    readonly status: number;
    readonly body: unknown;

    constructor(message: string, status: number, body: unknown) {
        super(message);

        this.name = 'ApiError';
        this.status = status;
        this.body = body;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

async function readResponseBody(response: Response): Promise<unknown> {
    if (response.status === 204 || response.body === null) {
        return undefined;
    }

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
        const responseBody: unknown = await response.json();

        return responseBody;
    }

    return response.text();
}

function createRequestHeaders(headersInit: HeadersInit | undefined): Headers {
    const headers = new Headers(headersInit);

    if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
    }

    return headers;
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const requestUrl = new URL(url, getApiBaseUrl());
    const headers = createRequestHeaders(options.headers);

    const response = await fetch(requestUrl, { ...options, headers });

    const body = await readResponseBody(response);

    if (!response.ok) {
        throw new ApiError('API request failed with status ' + String(response.status) + '.', response.status, body);
    }

    return { data: body, status: response.status, headers: response.headers } as T;
}
