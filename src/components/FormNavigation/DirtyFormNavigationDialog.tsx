import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import '@/components/FormNavigation/DirtyFormNavigationDialog.scss';

export type DirtyFormNavigationDialogProps = Readonly<{
    visible: boolean;
    message: string;
    onStay: () => void;
    onDiscard: () => void;
}>;

export function DirtyFormNavigationDialog({ visible, message, onStay, onDiscard }: DirtyFormNavigationDialogProps) {
    return (
        <Dialog
            visible={visible}
            modal
            draggable={false}
            resizable={false}
            dismissableMask={false}
            onHide={onStay}
            header={<h2 className='dirty-form-navigation-dialog__heading'>Discard unsaved changes?</h2>}
            pt={{
                root: { className: 'dirty-form-navigation-dialog' },
                header: { className: 'dirty-form-navigation-dialog__header' },
                content: { className: 'dirty-form-navigation-dialog__content' },
            }}
        >
            <p className='dirty-form-navigation-dialog__message'>{message}</p>

            <div className='dirty-form-navigation-dialog__actions'>
                <Button
                    type='button'
                    label='Stay on page'
                    outlined
                    onClick={onStay}
                    pt={{
                        root: {
                            className:
                                'dirty-form-navigation-dialog__button dirty-form-navigation-dialog__button--stay',
                        },
                    }}
                />
                <Button
                    type='button'
                    label='Discard changes'
                    onClick={onDiscard}
                    pt={{
                        root: {
                            className:
                                'dirty-form-navigation-dialog__button dirty-form-navigation-dialog__button--discard',
                        },
                    }}
                />
            </div>
        </Dialog>
    );
}
