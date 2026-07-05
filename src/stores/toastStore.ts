import type { ToastMessage } from 'primereact/toast';

export type AppToastMessage = ToastMessage;

const toastListeners = new Set<(message: AppToastMessage) => void>();

export function showToastMessage(message: AppToastMessage): void {
    for (const listener of toastListeners) {
        listener(message);
    }
}

export function subscribeToToastMessages(listener: (message: AppToastMessage) => void): () => void {
    toastListeners.add(listener);

    return () => {
        toastListeners.delete(listener);
    };
}
