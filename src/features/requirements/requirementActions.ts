import type { RequirementStatus } from '../../demo/demoTypes';
export function lifecycleActions(status:RequirementStatus){ if(status==='draft') return ['Edit','Approve','Reject']; if(status==='approved') return ['Mark implemented','Mark obsolete']; if(status==='rejected') return ['Mark obsolete']; return []; }
