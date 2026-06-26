import { useEffect, useRef, type ReactNode } from 'react';
import { Store, useStore } from '@tanstack/react-store';
import { Toast } from 'primereact/toast';
import type { ToastMessage } from 'primereact/toast';

type ToastStoreState = Readonly<{ showToast: (message: ToastMessage) => void }>;

const noopShowToast = () => undefined;

const toastStore = new Store<ToastStoreState>({ showToast: noopShowToast });

const setShowToast = (showToast: ToastStoreState['showToast']) => {
    toastStore.setState(() => ({ showToast }));
};

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
    const toastRef = useRef<Toast>(null);

    useEffect(() => {
        setShowToast((message) => {
            toastRef.current?.show({ life: 3500, ...message });
        });
        return () => setShowToast(noopShowToast);
    }, []);

    return (
        <>
            {children}
            <Toast ref={toastRef} />
        </>
    );
}

export function useToastMessages() {
    return useStore(toastStore, (state) => state);
}
