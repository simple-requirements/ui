export type Module = 'requirements' | 'categories';
export interface RequirementTabState {
    id: string;
    requirementId: string;
    visibleKey: string;
}
export interface WorkspaceState {
    activeAppTabId: string;
    openRequirementTabs: readonly RequirementTabState[];
    activeProjectId: string | null;
    activeModule: Module;
    selectedRequirementId: string | null;
    splitterPosition: number;
    mode: 'workspace' | 'newProject' | 'newRequirement' | 'newCategory';
}
export const WORKSPACE_TAB_ID = 'workspace';
export const initialWorkspaceState: WorkspaceState = {
    activeAppTabId: WORKSPACE_TAB_ID,
    openRequirementTabs: [],
    activeProjectId: null,
    activeModule: 'requirements',
    selectedRequirementId: null,
    splitterPosition: 0.55,
    mode: 'workspace',
};
export type Action =
    | { type: 'selectProject'; projectId: string | null }
    | { type: 'selectModule'; module: Module }
    | { type: 'selectRequirement'; requirementId: string | null }
    | { type: 'openRequirementTab'; requirementId: string; visibleKey: string }
    | { type: 'closeTab'; tabId: string }
    | { type: 'activateTab'; tabId: string }
    | { type: 'setSplitter'; position: number }
    | { type: 'setMode'; mode: WorkspaceState['mode'] };
/** Restricts the splitter position to the supported demo range. */
export function clampSplitter(v: number) {
    return Math.min(0.8, Math.max(0.25, v));
}
/** Applies workspace navigation, tab, selection, and layout actions without invalid duplicate tabs. */
export function workspaceReducer(s: WorkspaceState, a: Action): WorkspaceState {
    switch (a.type) {
        case 'selectProject':
            return {
                ...s,
                activeProjectId: a.projectId,
                selectedRequirementId: null,
                mode: 'workspace',
                activeModule: 'requirements',
                activeAppTabId: WORKSPACE_TAB_ID,
            };
        case 'selectModule':
            return { ...s, activeModule: a.module, mode: 'workspace' };
        case 'selectRequirement':
            return { ...s, selectedRequirementId: a.requirementId };
        case 'openRequirementTab': {
            const id = `req-tab-${a.requirementId}`;
            const tabs =
                s.openRequirementTabs.some((t) => t.id === id) ?
                    s.openRequirementTabs
                :   [...s.openRequirementTabs, { id, requirementId: a.requirementId, visibleKey: a.visibleKey }];
            return { ...s, openRequirementTabs: tabs, activeAppTabId: id };
        }
        case 'closeTab': {
            const tabs = s.openRequirementTabs.filter((t) => t.id !== a.tabId);
            return {
                ...s,
                openRequirementTabs: tabs,
                activeAppTabId: s.activeAppTabId === a.tabId ? WORKSPACE_TAB_ID : s.activeAppTabId,
            };
        }
        case 'activateTab':
            return { ...s, activeAppTabId: a.tabId };
        case 'setSplitter':
            return { ...s, splitterPosition: clampSplitter(a.position) };
        case 'setMode':
            return { ...s, mode: a.mode };
        default:
            return s;
    }
}
