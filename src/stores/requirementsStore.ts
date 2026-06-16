import type {
    CreateRequirementInput,
    DemoRequirement,
    DemoRequirementRepository,
    RequirementStatus,
} from '@/demo/demoTypes';

/** Snapshot shape for future requirement store subscriptions. */
export interface RequirementsStoreState {
    requirements: readonly DemoRequirement[];
    selectedRequirement: DemoRequirement | null;
    listLoading: boolean;
    detailLoading: boolean;
    error: string | null;
}

/** Creates requirement data operations backed by the replaceable demo repository boundary. */
export function createRequirementsStore(requirementRepository: DemoRequirementRepository) {
    return {
        async loadRequirements(projectId: string) {
            return [...(await requirementRepository.listRequirements(projectId))];
        },
        async loadRequirementDetail(requirementId: string) {
            return requirementRepository.getRequirement(requirementId);
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
