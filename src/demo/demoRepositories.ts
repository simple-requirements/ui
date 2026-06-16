/* eslint-disable */
import {
    DETAIL_LOAD_DELAY_MS,
    INITIAL_LOAD_DELAY_MS,
    MUTATION_DELAY_MS,
    PROJECT_LOAD_DELAY_MS,
    DEMO_DATA_KEY,
    getDemoError,
} from '@/demo/demoConfig';
import { demoCategories, initialProjects, initialRequirements } from '@/demo/demoData';
import type {
    Category,
    CreateProjectInput,
    CreateRequirementInput,
    DemoProjectRepository,
    DemoRequirement,
    DemoRequirementRepository,
    ProjectSummary,
} from '@/demo/demoTypes';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
type Store = { projects: ProjectSummary[]; requirements: DemoRequirement[]; categories: Category[] };
function load(): Store {
    try {
        const raw = sessionStorage.getItem(DEMO_DATA_KEY);
        if (raw) return JSON.parse(raw) as Store;
    } catch {
        /* reset */
    }
    return { projects: initialProjects(), requirements: [...initialRequirements], categories: [...demoCategories] };
}
function save(s: Store) {
    sessionStorage.setItem(DEMO_DATA_KEY, JSON.stringify(s));
}
function keyFor(s: Store, c: Category) {
    const nums = s.requirements
        .filter((r) => r.type === c.type)
        .map((r) => Number(r.visibleKey.split('-').at(-1)))
        .filter(Number.isFinite);
    return `${c.type}-${c.key}-${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
}
/** Creates the in-memory, session-backed demo repository implementation. */
export function createDemoRepositories(): DemoProjectRepository & DemoRequirementRepository {
    return {
        async listProjects() {
            await delay(INITIAL_LOAD_DELAY_MS);
            if (getDemoError() === 'projects') throw new Error('Demo project loading failed.');
            return load().projects;
        },
        async createProject(input: CreateProjectInput) {
            await delay(MUTATION_DELAY_MS);
            const s = load();
            const p = {
                id: `project-local-${Date.now()}`,
                name: input.name.trim() || 'Untitled Project',
                requirementCount: 0,
            };
            s.projects.push(p);
            save(s);
            return p;
        },
        async listRequirements(projectId: string) {
            await delay(PROJECT_LOAD_DELAY_MS);
            if (getDemoError() === 'project') throw new Error('Demo project content failed to load.');
            const s = load();
            if (!s.projects.some((p) => p.id === projectId)) throw new Error('Project not found.');
            return s.requirements.filter((r) => r.projectId === projectId);
        },
        async getRequirement(id: string) {
            await delay(DETAIL_LOAD_DELAY_MS);
            if (getDemoError() === 'requirement') throw new Error('Demo requirement detail failed to load.');
            const r = load().requirements.find((x) => x.id === id);
            if (!r) throw new Error('Requirement not found.');
            return r;
        },
        async createRequirement(projectId: string, input: CreateRequirementInput) {
            await delay(MUTATION_DELAY_MS);
            const s = load();
            const c = s.categories.find((x) => x.key === input.categoryKey) ?? s.categories[0];
            const r = {
                id: `req-local-${Date.now()}`,
                projectId,
                visibleKey: keyFor(s, c),
                categoryKey: c.key,
                categoryName: c.name,
                type: c.type,
                description: input.description,
                priority: input.priority,
                status: 'draft' as const,
                owner: input.owner,
                rationale: input.rationale,
                source: input.source,
            };
            s.requirements.push(r);
            s.projects = s.projects.map((p) =>
                p.id === projectId ? { ...p, requirementCount: p.requirementCount + 1 } : p,
            );
            save(s);
            return r;
        },
        async updateRequirement(id: string, patch: Partial<DemoRequirement>) {
            await delay(MUTATION_DELAY_MS);
            const s = load();
            const i = s.requirements.findIndex((r) => r.id === id);
            if (i < 0) throw new Error('Requirement not found.');
            s.requirements[i] = { ...s.requirements[i], ...patch };
            save(s);
            return s.requirements[i];
        },
        async transitionRequirement(id: string, status) {
            return this.updateRequirement(id, { status });
        },
        async deleteDraft(id: string) {
            await delay(MUTATION_DELAY_MS);
            const s = load();
            const r = s.requirements.find((x) => x.id === id);
            if (!r || r.status !== 'draft') throw new Error('Only draft requirements can be deleted.');
            s.requirements = s.requirements.filter((x) => x.id !== id);
            s.projects = s.projects.map((p) =>
                p.id === r.projectId ? { ...p, requirementCount: Math.max(0, p.requirementCount - 1) } : p,
            );
            save(s);
        },
        async listCategories() {
            await delay(80);
            return load().categories;
        },
        async createCategory(input: Category) {
            await delay(MUTATION_DELAY_MS);
            const s = load();
            s.categories.push(input);
            save(s);
            return input;
        },
    };
}
