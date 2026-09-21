import type { ToastMessage } from 'primereact/toast';

export type AppToastMessage = ToastMessage;

const toastListeners = new Set<(message: AppToastMessage) => void>();

/** Publishes a transient application toast event to the mounted toast host. */
export function showToastMessage(message: AppToastMessage): void {
    for (const listener of toastListeners) {
        listener(message);
    }
}

/** Subscribes to transient application toast events. */
export function subscribeToToastMessages(listener: (message: AppToastMessage) => void): () => void {
    toastListeners.add(listener);

    return () => {
        toastListeners.delete(listener);
    };
}
