import { useCallback, useEffect, useState } from 'react';

export type UseLoadingTimeoutOptions = Readonly<{ active: boolean; timeoutMs: number }>;

export type UseLoadingTimeoutResult = Readonly<{ timedOut: boolean; reset: () => void }>;

export function useLoadingTimeout({ active, timeoutMs }: UseLoadingTimeoutOptions): UseLoadingTimeoutResult {
    const [timedOut, setTimedOut] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    useEffect(() => {
        if (!active) {
            setTimedOut(false);

            return;
        }

        const timeoutId = window.setTimeout(() => {
            setTimedOut(true);
        }, timeoutMs);

        return () => window.clearTimeout(timeoutId);
    }, [active, resetKey, timeoutMs]);

    const reset = useCallback(() => {
        setTimedOut(false);
        setResetKey((currentResetKey) => currentResetKey + 1);
    }, []);

    return { timedOut, reset };
}
