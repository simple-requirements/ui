import { initialWorkspaceState, type WorkspaceState } from './workspaceReducer';
export const WORKSPACE_STATE_KEY='requirements-app.demo-workspace.v1';
export function loadWorkspaceState():WorkspaceState{try{const raw=sessionStorage.getItem(WORKSPACE_STATE_KEY); if(!raw)return initialWorkspaceState; const p=JSON.parse(raw) as Partial<WorkspaceState>; if(typeof p.activeAppTabId==='string'&&Array.isArray(p.openRequirementTabs)) return {...initialWorkspaceState,...p};}catch{/* reset */} return initialWorkspaceState;}
export function saveWorkspaceState(s:WorkspaceState){sessionStorage.setItem(WORKSPACE_STATE_KEY,JSON.stringify(s));}
