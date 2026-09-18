import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

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
            header={
                <h2 className='dirty-form-navigation-dialog__heading ui-dialog__heading'>Discard unsaved changes?</h2>
            }
            pt={{
                root: { className: 'dirty-form-navigation-dialog ui-dialog ui-dialog--compact' },
                header: { className: 'dirty-form-navigation-dialog__header ui-dialog__header' },
                content: { className: 'dirty-form-navigation-dialog__content ui-dialog__content' },
            }}>
            <p className='dirty-form-navigation-dialog__message ui-dialog__message'>{message}</p>

            <div className='dirty-form-navigation-dialog__actions ui-dialog__actions'>
                <Button
                    type='button'
                    label='Stay on page'
                    outlined
                    onClick={onStay}
                    pt={{ root: { className: 'ui-button ui-button--outline ui-button--dialog' } }}
                />
                <Button
                    type='button'
                    label='Discard changes'
                    onClick={onDiscard}
                    pt={{ root: { className: 'ui-button ui-button--primary ui-button--dialog' } }}
                />
            </div>
        </Dialog>
    );
}
