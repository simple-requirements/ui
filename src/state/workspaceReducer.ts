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
    mode:
        | 'workspace'
        | 'newProject'
        | 'newCategory'
        | 'newRequirement'
        | 'editRequirement'
        | 'editRequirementTab'
        | 'history'
        | 'historyTab';
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
export function workspaceReducer(state: WorkspaceState, action: Action): WorkspaceState {
    switch (action.type) {
        case 'selectProject':
            return {
                ...state,
                activeProjectId: action.projectId,
                selectedRequirementId: null,
                mode: 'workspace',
                activeModule: 'requirements',
                activeAppTabId: WORKSPACE_TAB_ID,
            };
        case 'selectModule':
            return { ...state, activeModule: action.module, mode: 'workspace' };
        case 'selectRequirement':
            return {
                ...state,
                selectedRequirementId: action.requirementId,
                mode: state.mode === 'history' ? 'workspace' : state.mode,
            };
        case 'openRequirementTab': {
            const id = `req-tab-${action.requirementId}`;
            const tabs =
                state.openRequirementTabs.some((t) => t.id === id) ?
                    state.openRequirementTabs
                :   [
                        ...state.openRequirementTabs,
                        { id, requirementId: action.requirementId, visibleKey: action.visibleKey },
                    ];
            return { ...state, openRequirementTabs: tabs, activeAppTabId: id };
        }
        case 'closeTab': {
            const tabs = state.openRequirementTabs.filter((t) => t.id !== action.tabId);
            return {
                ...state,
                openRequirementTabs: tabs,
                activeAppTabId: state.activeAppTabId === action.tabId ? WORKSPACE_TAB_ID : state.activeAppTabId,
            };
        }
        case 'activateTab':
            return { ...state, activeAppTabId: action.tabId };
        case 'setSplitter':
            return { ...state, splitterPosition: clampSplitter(action.position) };
        case 'setMode':
            return { ...state, mode: action.mode };
        default:
            return state;
    }
}
