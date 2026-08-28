import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';

type Props = Readonly<{
    visible: boolean;
    pending?: boolean;
    onAbort: () => void;
    onConfirm: (name: string) => void | Promise<void>;
}>;

export function ReviewNameDialog({ visible, pending = false, onAbort, onConfirm }: Props) {
    const [name, setName] = useState('');
    const valid = name.trim().length > 0;

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
            <form
                className='review-dialog__form'
                onSubmit={(event) => {
                    event.preventDefault();
                    if (valid) void onConfirm(name.trim());
                }}
            >
                <label htmlFor='review-resolver-name'>Name</label>
                <InputText
                    id='review-resolver-name'
                    value={name}
                    disabled={pending}
                    onChange={(event) => setName(event.currentTarget.value)}
                />
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
                        type='submit'
                        label='Resolve'
                        disabled={!valid || pending}
                        pt={{ root: { className: 'review-dialog__button review-dialog__button--confirm' } }}
                    />
                </div>
            </form>
        </Dialog>
    );
}
