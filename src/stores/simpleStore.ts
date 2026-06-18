/** Minimal value container retained for demo/test repositories that need a store-like state holder. */
export interface SimpleStore<TState> {
    readonly state: TState;
    setState(updater: (currentState: TState) => TState): void;
}

/** Creates a small synchronous store for legacy demo repositories without affecting production server state. */
export function createSimpleStore<TState>(initialState: TState): SimpleStore<TState> {
    let currentState = initialState;
    return {
        get state() {
            return currentState;
        },
        setState(updater) {
            currentState = updater(currentState);
        },
    };
}
