import { useRef } from 'react';
import { useNavigate } from 'react-router';

import { useDirtyFormNavigationGuard } from '@/components/FormNavigation/useDirtyFormNavigationGuard';
import {
    getProjectRequirementDetailsRoute,
    getProjectRequirementEditRoute,
    getProjectRequirementsRoute,
} from '@/router/projectRoutes';

import type { RequirementFormMode } from '@/pages/ProjectRequirements/Form/requirementFormTypes';

export type RequirementFormNavigation = Readonly<{
    formRoute: string;
    allowNavigation: () => void;
    dirtyNavigationDialogVisible: boolean;
    stayOnPage: () => void;
    discardChanges: () => void;
    handleAbort: () => void;
}>;

export function useRequirementFormNavigation(
    projectId: string | undefined,
    requirementId: string | undefined,
    mode: RequirementFormMode,
    isDirty: boolean,
): RequirementFormNavigation {
    const navigate = useNavigate();
    const allowNavigationRef = useRef(false);
    const dirtyFormNavigation = useDirtyFormNavigationGuard(isDirty, allowNavigationRef);

    const formRoute =
        projectId === undefined ? ''
        : mode === 'create' ? getProjectRequirementsRoute(projectId)
        : getProjectRequirementEditRoute(projectId, requirementId ?? '');

    function allowNavigation(): void {
        allowNavigationRef.current = true;
    }

    function handleAbort(): void {
        if (projectId === undefined) {
            return;
        }

        const abortRoute =
            mode === 'update' && requirementId !== undefined ?
                getProjectRequirementDetailsRoute(projectId, requirementId)
            :   getProjectRequirementsRoute(projectId);

        dirtyFormNavigation.requestNavigation(() => {
            void navigate(abortRoute);
        });
    }

    return {
        formRoute,
        allowNavigation,
        dirtyNavigationDialogVisible: dirtyFormNavigation.dialogVisible,
        stayOnPage: dirtyFormNavigation.stayOnPage,
        discardChanges: dirtyFormNavigation.discardChanges,
        handleAbort,
    };
}
