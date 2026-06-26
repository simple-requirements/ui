import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react';
import { Toast } from 'primereact/toast';
import type { ToastMessage } from 'primereact/toast';

type ToastContextValue = Readonly<{
    showToast: (message: ToastMessage) => void;
}>;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
    const toastRef = useRef<Toast>(null);

    const showToast = useCallback((message: ToastMessage) => {
        toastRef.current?.show({ life: 3500, ...message });
    }, []);

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Toast ref={toastRef} />
        </ToastContext.Provider>
    );
}

export function useToastMessages() {
    const value = useContext(ToastContext);
    if (!value) throw new Error('useToastMessages must be used inside ToastProvider.');
    return value;
}
