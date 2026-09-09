import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

type Props = Readonly<{
    visible: boolean;
    pending?: boolean;
    onAbort: () => void;
    onConfirm: () => void | Promise<void>;
}>;

export function ReviewNameDialog({ visible, pending = false, onAbort, onConfirm }: Props) {
    return (
        <Dialog
            visible={visible}
            modal
            dismissableMask={false}
            closable={false}
            closeOnEscape={!pending}
            draggable={false}
            resizable={false}
            header={<h2 className='review-dialog__heading'>Resolve comment</h2>}
            pt={{
                root: { className: 'review-dialog' },
                header: { className: 'review-dialog__header' },
                content: { className: 'review-dialog__content' },
            }}
            onHide={onAbort}
        >
            <div className='review-dialog__form'>
                <p>The backend records the resolver from the authenticated session.</p>
                <div className='review-dialog__actions'>
                    <Button
                        type='button'
                        outlined
                        label='Abort'
                        disabled={pending}
                        pt={{ root: { className: 'review-dialog__button review-dialog__button--abort' } }}
                        onClick={onAbort}
                    />
                    <Button
                        type='button'
                        label='Resolve'
                        disabled={pending}
                        pt={{ root: { className: 'review-dialog__button review-dialog__button--confirm' } }}
                        onClick={() => void onConfirm()}
                    />
                </div>
            </div>
        </Dialog>
    );
}
