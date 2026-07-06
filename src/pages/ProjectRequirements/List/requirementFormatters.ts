import type { Requirement } from '@/api/requirementsApi';

export function formatNullableValue(value: string | null): string {
    return value ?? '—';
}

export function formatStatus(status: Requirement['status']): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}
