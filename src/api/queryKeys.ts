export const projectKeys = {
    all: ['projects'] as const,
    detail: (projectId: string) => ['projects', projectId] as const,
};
export const categoryKeys = {
    all: ['categories'] as const,
    detail: (categoryId: string) => ['categories', categoryId] as const,
};
export const requirementKeys = {
    list: (projectId: string) => ['requirements', 'list', projectId] as const,
    detail: (requirementId: string) => ['requirements', 'detail', requirementId] as const,
    byVisibleKey: (visibleKey: string) => ['requirements', 'visible-key', visibleKey] as const,
};
