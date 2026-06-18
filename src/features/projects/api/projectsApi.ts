import type { ProjectSummary } from '@/types/domain';
import { createDemoRepositories } from '@/demo/demoRepositories';

const demoRepositories = createDemoRepositories();

export function listProjects(): Promise<ProjectSummary[]> {
    return demoRepositories.listProjects().then((projects) => [...projects]);
}
