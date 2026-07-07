import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router';

export type DirtyFormNavigationGuard = Readonly<{
    dialogVisible: boolean;
    requestNavigation: (navigation: () => void) => void;
    stayOnPage: () => void;
    discardChanges: () => void;
}>;

export function useDirtyFormNavigationGuard(
    isDirty: boolean,
    allowNavigationRef: RefObject<boolean>,
): DirtyFormNavigationGuard {
    const [dialogVisible, setDialogVisible] = useState(false);
    const pendingNavigationRef = useRef<(() => void) | undefined>(undefined);

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

        pendingNavigationRef.current = () => {
            allowNavigationRef.current = true;
            blocker.proceed();
        };
        setDialogVisible(true);
    }, [allowNavigationRef, blocker]);

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

    const stayOnPage = useCallback(() => {
        pendingNavigationRef.current = undefined;
        setDialogVisible(false);

        if (blocker.state === 'blocked') {
            blocker.reset();
        }
    }, [blocker]);

    const discardChanges = useCallback(() => {
        const pendingNavigation = pendingNavigationRef.current;

        pendingNavigationRef.current = undefined;
        setDialogVisible(false);
        pendingNavigation?.();
    }, []);

    const requestNavigation = useCallback(
        (navigation: () => void) => {
            if (allowNavigationRef.current || !isDirty) {
                navigation();

                return;
            }

            pendingNavigationRef.current = () => {
                allowNavigationRef.current = true;
                navigation();
            };
            setDialogVisible(true);
        },
        [allowNavigationRef, isDirty],
    );

    return { dialogVisible, requestNavigation, stayOnPage, discardChanges };
}
