import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RequirementForm } from '@/features/requirements/components/RequirementForm';
import type { Category, ProjectSummary } from '@/types/domain';

vi.mock('@/features/metrics/api/metricQueries', () => ({ useProjectMetricsQuery: () => ({ data: [] }) }));

const project: ProjectSummary = { id: 'project-1', name: 'Reporting and Analytics', requirementCount: 0 };
const categories: Category[] = [{ id: 'category-1', key: 'DATA', name: 'Data Management', type: 'FR' }];

const renderRequirementForm = () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RequirementForm
                mode='create'
                project={project}
                categories={categories}
                error={null}
                pending={false}
                onSubmit={vi.fn()}
                onCancel={vi.fn()}
            />,
        );
    });

    return { container, root };
};

describe('RequirementForm component', () => {
    let root: Root | null = null;
    let container: HTMLElement | null = null;

    beforeEach(() => {
        const rendered = renderRequirementForm();
        root = rendered.root;
        container = rendered.container;
    });

    afterEach(() => {
        if (root) act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
    });

    it('keeps the code editor active by default and accepts single-character text input', () => {
        const codeButton = document.querySelector<HTMLButtonElement>('.requirement-form__mode-button--code');
        const visualButton = document.querySelector<HTMLButtonElement>('.requirement-form__mode-button--visual');
        const description = document.querySelector<HTMLTextAreaElement>('#requirement-description');

        expect(codeButton?.getAttribute('aria-pressed')).toBe('true');
        expect(codeButton?.className).toContain('p-button-info');
        expect(visualButton?.getAttribute('aria-pressed')).toBe('false');
        expect(visualButton?.className).toContain('p-button-secondary');
        expect(description).not.toBeNull();

        act(() => {
            if (!description) throw new Error('Requirement description textarea was not rendered.');
            description.value = 'a';
            description.dispatchEvent(new Event('input', { bubbles: true }));
        });

        expect(document.querySelector<HTMLTextAreaElement>('#requirement-description')?.value).toBe('a');
    });
});
