import type { RefObject } from 'react';
import { useEffect } from 'react';
import { useBlocker } from 'react-router';

import { DISCARD_CATEGORY_FORM_CHANGES_MESSAGE } from '@/pages/ProjectCategories/Form/categoryFormTypes';

export function useUnsavedCategoryFormGuard(isDirty: boolean, allowNavigationRef: RefObject<boolean>): void {
    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        if (allowNavigationRef.current || !isDirty) {
            return false;
        }

        return currentLocation.pathname !== nextLocation.pathname;
    });

    useEffect(() => {
        if (blocker.state !== 'blocked') {
            return;
        }

        if (window.confirm(DISCARD_CATEGORY_FORM_CHANGES_MESSAGE)) {
            blocker.proceed();

            return;
        }

        blocker.reset();
    }, [blocker]);

    useEffect(() => {
        if (!isDirty) {
            return undefined;
        }

        const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
            event.preventDefault();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);
}
