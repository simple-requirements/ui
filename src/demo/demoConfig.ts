export const INITIAL_LOAD_DELAY_MS=500; export const PROJECT_LOAD_DELAY_MS=350; export const DETAIL_LOAD_DELAY_MS=200; export const MUTATION_DELAY_MS=250;
export const DEMO_DATA_KEY='requirements-app.demo-data.v1';
export function getDemoError(){ return new URLSearchParams(location.search).get('demoError') as 'projects'|'project'|'requirement'|null }
