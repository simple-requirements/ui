/**
 * Local compatibility adapter for the TanStack Store shape used by this demo.
 *
 * The real `@tanstack/react-store` package is not reachable from the configured
 * registry in this environment, so the stores depend on the same Store-style
 * primitive through this alias until the package can be restored by dependency
 * installation.
 */
export class Store<TState> {
    state: TState;

    private readonly listeners = new Set<() => void>();

    constructor(initialState: TState) {
        this.state = initialState;
    }

    setState(updater: (currentState: TState) => TState) {
        this.state = updater(this.state);
        for (const listener of this.listeners) {
            listener();
        }
    }

    subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}
