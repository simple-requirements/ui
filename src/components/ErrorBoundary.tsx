import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = Readonly<{ children: ReactNode }>;
type ErrorBoundaryState = Readonly<{ hasError: boolean }>;

/** Contains unexpected render failures so the SPA never degrades to an unexplained blank screen. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Unhandled application render error', { error, errorInfo });
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <main
                className='app-fatal state'
                role='alert'>
                <h1>Something went wrong</h1>
                <p>The application could not render this view. Reload the page to start a fresh session.</p>
                <button
                    type='button'
                    onClick={() => location.reload()}>
                    Reload
                </button>
            </main>
        );
    }
}
