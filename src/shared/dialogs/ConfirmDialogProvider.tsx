import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import type { ButtonProps } from 'primereact/button';

export type ConfirmDialogOptions = Readonly<{
    title: string;
    message: string;
    acceptLabel?: string;
    rejectLabel?: string;
    acceptSeverity?: ButtonProps['severity'];
}>;

type PendingConfirmation = ConfirmDialogOptions & Readonly<{ resolve: (confirmed: boolean) => void }>;

type ConfirmDialogContextValue = Readonly<{ confirm: (options: ConfirmDialogOptions) => Promise<boolean> }>;

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

export function ConfirmDialogProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);

    const close = useCallback(
        (confirmed: boolean) => {
            const current = pendingConfirmation;
            if (!current) return;
            current.resolve(confirmed);
            setPendingConfirmation(null);
        },
        [pendingConfirmation],
    );

    const confirm = useCallback(
        (options: ConfirmDialogOptions) =>
            new Promise<boolean>((resolve) => {
                setPendingConfirmation({ ...options, resolve });
            }),
        [],
    );

    const value = useMemo(() => ({ confirm }), [confirm]);

    const footer =
        pendingConfirmation ?
            <div className='form__actions confirm-dialog__actions'>
                <Button
                    type='button'
                    label={pendingConfirmation.rejectLabel ?? 'Cancel'}
                    severity='danger'
                    onClick={() => close(false)}
                />
                <Button
                    type='button'
                    label={pendingConfirmation.acceptLabel ?? 'Confirm'}
                    severity={pendingConfirmation.acceptSeverity ?? 'success'}
                    autoFocus
                    onClick={() => close(true)}
                />
            </div>
        :   null;

    return (
        <ConfirmDialogContext.Provider value={value}>
            {children}
            <Dialog
                className='confirm-dialog'
                header={pendingConfirmation?.title ?? 'Confirm action'}
                visible={pendingConfirmation !== null}
                modal
                closable
                onHide={() => close(false)}
                footer={footer}
                style={{ width: 'min(32rem, calc(100vw - 2rem))' }}>
                <p>{pendingConfirmation?.message}</p>
            </Dialog>
        </ConfirmDialogContext.Provider>
    );
}

export function useConfirmDialog() {
    const value = useContext(ConfirmDialogContext);
    if (!value) throw new Error('useConfirmDialog must be used inside ConfirmDialogProvider.');
    return value;
}
