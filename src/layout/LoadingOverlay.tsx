/** Blocks the viewport while the initial workspace state is loading. */
export function LoadingOverlay() {
    return (
        <div
            className='loading-overlay'
            role='status'
            aria-live='polite'
            aria-label='Loading application'>
            Loading workspace…
        </div>
    );
}
