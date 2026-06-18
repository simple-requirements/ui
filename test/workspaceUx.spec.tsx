import { act } from 'react';
import type React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { ActionBar } from '@/components/ActionBar';
import { AppTabBar } from '@/components/AppTabBar';
import { NewCategoryForm } from '@/components/NewCategoryForm';
import { RequirementForm } from '@/components/RequirementForm';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import type { Category, ProjectSummary, RequirementView } from '@/types/domain';

let root: Root | null = null;
const render = (node: React.ReactNode) => {
    const host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    act(() => root?.render(node));
    return host;
};

afterEach(() => {
    act(() => root?.unmount());
    root = null;
    document.body.replaceChildren();
    vi.restoreAllMocks();
});

const requirement: RequirementView = {
    id: 'req-1',
    projectId: 'project-beta',
    visibleKey: 'FR-UI-0028',
    categoryId: 'cat-1',
    categoryKey: 'UI',
    categoryName: 'User Interface',
    type: 'FR',
    description: 'Desc',
    priority: 'P1',
    status: 'draft',
    owner: null,
    rationale: null,
    source: null,
};
const category: Category = { id: 'cat-1', key: 'UI', name: 'User Interface', type: 'FR' };
const project: ProjectSummary = { id: 'project-beta', name: 'Customer Portal', requirementCount: 1 };

describe('workspace UX regressions', () => {
    it('uses Copy key wording and reports clipboard success and failure after completion', async () => {
        const writeText = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('denied'));
        Object.assign(navigator, { clipboard: { writeText } });
        const host = render(
            <ActionBar
                activeProjectId='project-beta'
                selectedRequirement={requirement}
                canCreateRequirement
                dispatch={() => undefined}
            />,
        );
        const button = Array.from(host.querySelectorAll('button')).find((item) => item.textContent === 'Copy key');
        expect(button).toBeTruthy();
        expect(host.textContent).not.toContain('Copy visible key');
        await act(async () => {
            button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });
        expect(host.textContent).toContain('Key copied.');
        await act(async () => {
            button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });
        expect(host.textContent).toContain('Could not copy the key.');
    });

    it('keeps the New Project button centered without offsets and lets right-pane forms span the pane', () => {
        const host = render(
            <ProjectSidebar
                projects={[project]}
                activeProjectId='project-beta'
                dispatch={() => undefined}
            />,
        );
        expect(host.querySelector('button.new-project')?.textContent).toContain('New Project');

        const sidebarStyles = readFileSync('src/styles/sidebar.scss', 'utf8');
        expect(sidebarStyles).toContain('.new-project.p-button');
        expect(sidebarStyles).toContain('align-items: center;');
        expect(sidebarStyles).toContain('justify-content: center;');
        expect(sidebarStyles).not.toMatch(/translateY|top:\s*-|margin-top:\s*-/);

        const formStyles = readFileSync('src/styles/forms.scss', 'utf8');
        expect(formStyles).toContain('.right-pane > .form');
        expect(formStyles).toContain('grid-row: 1 / -1;');
        expect(formStyles).toContain('min-height: 0;');
    });

    it('renders accessible lookup, form fields, radio group, and tab close controls', () => {
        const host = render(
            <>
                <ActionBar
                    activeProjectId='project-beta'
                    selectedRequirement={null}
                    canCreateRequirement
                    dispatch={() => undefined}
                />
                <RequirementForm
                    mode='create'
                    project={project}
                    categories={[category]}
                    error={null}
                    pending={false}
                    onSubmit={() => undefined}
                    onCancel={() => undefined}
                />
                <NewCategoryForm
                    error={null}
                    pending={false}
                    onSubmit={() => undefined}
                    onCancel={() => undefined}
                />
                <AppTabBar
                    activeAppTabId='workspace'
                    openRequirementTabs={[{ id: 'req-tab-req-1', requirementId: 'req-1', visibleKey: 'FR-UI-0028' }]}
                    dispatch={() => undefined}
                />
            </>,
        );
        expect(host.querySelector('[aria-label="Requirement key"]')).toBeTruthy();
        expect(host.querySelector('label[for="requirement-category"]')?.textContent).toContain('Category');
        expect(host.textContent).toContain('Derived type: FR');
        expect(host.querySelector('label[for="category-key"]')?.textContent).toBe('Category key');
        expect(host.querySelector('fieldset legend')?.textContent).toBe('Category type');
        expect(host.querySelector('button[aria-label="Close FR-UI-0028"]')).toBeTruthy();
        expect(host.querySelector('.app-tabs__tab--workspace + .app-tabs__close')).toBeNull();
    });
});
