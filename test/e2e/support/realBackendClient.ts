import { expect } from '@playwright/test';

import { apiUrl, E2E_ACCESS_TOKEN } from './e2eEnv';

export function authenticatedHeaders(headers?: HeadersInit): Headers {
    const result = new Headers(headers);
    result.set('Accept', 'application/json');
    result.set('Authorization', `Bearer ${E2E_ACCESS_TOKEN}`);
    return result;
}

function jsonHeaders(headers?: HeadersInit): Headers {
    const result = authenticatedHeaders(headers);
    result.set('Content-Type', 'application/json');
    return result;
}

async function readResponseBody(response: Response): Promise<unknown> {
    if (response.status === 204) return undefined;

    const text = await response.text();
    if (text.trim().length === 0) return undefined;

    try {
        return JSON.parse(text) as unknown;
    } catch {
        return text;
    }
}

export async function requestJson<T>(
    path: string,
    init: RequestInit = {},
    expectedStatus: number | readonly number[] = 200,
): Promise<T> {
    const statuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    const response = await fetch(apiUrl(path), { ...init, headers: init.headers ?? authenticatedHeaders() });
    const body = await readResponseBody(response);

    expect(
        statuses,
        `Expected ${init.method ?? 'GET'} ${path} to return ${statuses.join(' or ')}, got ${String(response.status)} with ${JSON.stringify(body)}.`,
    ).toContain(response.status);

    return body as T;
}

export async function requestEmpty(
    path: string,
    init: RequestInit = {},
    expectedStatus: number | readonly number[] = 204,
): Promise<void> {
    await requestJson<unknown>(path, init, expectedStatus);
}

export async function publicRequestJson<T>(
    path: string,
    init: RequestInit = {},
    expectedStatus: number | readonly number[] = 200,
): Promise<T> {
    const headers = new Headers(init.headers);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');

    const response = await fetch(apiUrl(path), { ...init, headers });
    const body = await readResponseBody(response);
    const statuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];

    expect(
        statuses,
        `Expected ${init.method ?? 'GET'} ${path} to return ${statuses.join(' or ')}, got ${String(response.status)} with ${JSON.stringify(body)}.`,
    ).toContain(response.status);

    return body as T;
}

export async function publicRequestEmpty(
    path: string,
    init: RequestInit = {},
    expectedStatus: number | readonly number[] = 204,
): Promise<void> {
    await publicRequestJson<unknown>(path, init, expectedStatus);
}

export function jsonRequest(method: 'POST' | 'PATCH' | 'PUT', data: unknown): RequestInit {
    return { method, headers: jsonHeaders(), body: JSON.stringify(data) };
}

export function publicJsonRequest(method: 'POST' | 'PATCH' | 'PUT', data: unknown): RequestInit {
    return {
        method,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    };
}
