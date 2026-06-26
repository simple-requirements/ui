import { useCallback, type ReactNode } from 'react';
import { Store, useStore } from '@tanstack/react-store';
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

type ConfirmDialogState = Readonly<{ pendingConfirmation: PendingConfirmation | null }>;

const confirmDialogStore = new Store<ConfirmDialogState>({ pendingConfirmation: null });

const setPendingConfirmation = (pendingConfirmation: PendingConfirmation | null) => {
    confirmDialogStore.setState(() => ({ pendingConfirmation }));
};

export function ConfirmDialogProvider({ children }: Readonly<{ children: ReactNode }>) {
    const pendingConfirmation = useStore(confirmDialogStore, (state) => state.pendingConfirmation);

    const close = useCallback(
        (confirmed: boolean) => {
            if (!pendingConfirmation) return;
            pendingConfirmation.resolve(confirmed);
            setPendingConfirmation(null);
        },
        [pendingConfirmation],
    );

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
        <>
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
        </>
    );
}

export function useConfirmDialog() {
    const confirm = useCallback(
        (options: ConfirmDialogOptions) =>
            new Promise<boolean>((resolve) => {
                setPendingConfirmation({ ...options, resolve });
            }),
        [],
    );

    return { confirm };
}
