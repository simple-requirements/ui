import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import type { Metric } from '@/api/metricsApi';
import type { Requirement } from '@/api/requirementsApi';
import { MetricDetailsPanel } from '@/pages/ProjectMetrics/MetricDetailsPanel';

const metric: Metric = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    key: 'MET-0001',
    value: '2000 ms',
    description: 'Maximum response time',
    active: true,
    createdAt: '2026-09-30T10:00:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z',
};

afterEach(cleanup);

const referencingRequirement = {
    id: '33333333-3333-4333-8333-333333333333',
    projectId: metric.projectId,
    visibleKey: 'NFR-PERF-0001',
} as Requirement;

describe('MetricDetailsPanel', () => {
    it('renders the metric key, value, description and state without mutation controls.', () => {
        render(
            <MemoryRouter>
                <MetricDetailsPanel metric={metric} title='Metric MET-0001' titleElement='h1' />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { name: 'Metric MET-0001' })).toBeInTheDocument();
        expect(screen.getByText('MET-0001')).toBeInTheDocument();
        expect(screen.getByText('2000 ms')).toBeInTheDocument();
        expect(screen.getByText('Maximum response time')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    });

    it('shows usage count and links to referencing requirements.', () => {
        render(
            <MemoryRouter>
                <MetricDetailsPanel
                    metric={metric}
                    title='Metric details'
                    referencingRequirements={[referencingRequirement]}
                />
            </MemoryRouter>,
        );

        expect(screen.getByText('Usage count').nextElementSibling).toHaveTextContent('1');
        expect(screen.getByRole('link', { name: 'NFR-PERF-0001' })).toHaveAttribute(
            'href',
            `/projects/${metric.projectId}/requirements/${referencingRequirement.id}`,
        );
    });

    it('shows deactivated state.', () => {
        render(
            <MemoryRouter>
                <MetricDetailsPanel metric={{ ...metric, active: false }} title='Metric details' />
            </MemoryRouter>,
        );
        expect(screen.getByText('Deactivated')).toBeInTheDocument();
    });
});
