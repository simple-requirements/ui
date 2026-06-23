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

export const requirementRevisionKeys = {
    all: (requirementId: string) => ['requirements', requirementId, 'revisions'] as const,
    list: (requirementId: string) => ['requirements', requirementId, 'revisions', 'list'] as const,
    detail: (requirementId: string, revisionNumber: number) =>
        ['requirements', requirementId, 'revisions', revisionNumber] as const,
};

export const metricKeys = {
    list: (projectId: string) => ['metrics', 'list', projectId] as const,
    key: (projectId: string, key: string) => ['metrics', 'key', projectId, key] as const,
};

export const requirementLinkKeys = {
    all: (requirementId: string) => ['requirements', requirementId, 'links'] as const,
    current: (requirementId: string) => ['requirements', requirementId, 'links', 'current'] as const,
    history: (requirementId: string) => ['requirements', requirementId, 'links', 'history'] as const,
    revision: (requirementId: string, revisionNumber: number) =>
        ['requirements', requirementId, 'links', 'revisions', revisionNumber] as const,
    changes: (requirementId: string, fromRevision: number, toRevision: number) =>
        ['requirements', requirementId, 'links', 'changes', fromRevision, toRevision] as const,
};
