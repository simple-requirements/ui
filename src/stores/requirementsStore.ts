import { createSimpleStore } from '@/stores/simpleStore';
import type {
    CreateRequirementInput,
    DemoRequirement,
    DemoRequirementRepository,
    RequirementStatus,
} from '@/demo/demoTypes';

/** Snapshot shape for requirement store subscriptions. */
export interface RequirementsStoreState {
    requirements: readonly DemoRequirement[];
    selectedRequirement: DemoRequirement | null;
    listLoading: boolean;
    detailLoading: boolean;
    error: string | null;
}

/** Creates requirement data operations backed by a TanStack-style store and the replaceable demo repository boundary. */
export function createRequirementsStore(requirementRepository: DemoRequirementRepository) {
    const store = createSimpleStore<RequirementsStoreState>({
        requirements: [],
        selectedRequirement: null,
        listLoading: false,
        detailLoading: false,
        error: null,
    });

    return {
        store,
        async loadRequirements(projectId: string) {
            store.setState((currentState) => ({ ...currentState, listLoading: true, error: null }));
            try {
                const requirements = [...(await requirementRepository.listRequirements(projectId))];
                store.setState((currentState) => ({ ...currentState, requirements, listLoading: false, error: null }));
                return requirements;
            } catch (error) {
                store.setState((currentState) => ({
                    ...currentState,
                    listLoading: false,
                    error: (error as Error).message,
                }));
                throw error;
            }
        },
        async loadRequirementDetail(requirementId: string) {
            store.setState((currentState) => ({ ...currentState, detailLoading: true, error: null }));
            try {
                const selectedRequirement = await requirementRepository.getRequirement(requirementId);
                store.setState((currentState) => ({
                    ...currentState,
                    selectedRequirement,
                    detailLoading: false,
                    error: null,
                }));
                return selectedRequirement;
            } catch (error) {
                store.setState((currentState) => ({
                    ...currentState,
                    selectedRequirement: null,
                    detailLoading: false,
                    error: (error as Error).message,
                }));
                throw error;
            }
        },
        async createRequirement(projectId: string, input: CreateRequirementInput) {
            return requirementRepository.createRequirement(projectId, input);
        },
        async transitionRequirement(requirementId: string, status: RequirementStatus) {
            return requirementRepository.transitionRequirement(requirementId, status);
        },
        async deleteDraftRequirement(requirementId: string) {
            return requirementRepository.deleteDraft(requirementId);
        },
    };
}
