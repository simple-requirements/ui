import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useState } from 'react';

type Props = Readonly<{
    visible: boolean;
    title: string;
    textLabel: string;
    confirmLabel: string;
    pending?: boolean;
    onAbort: () => void;
    onConfirm: (text: string) => void | Promise<void>;
}>;

export function ReviewTextDialog({
    visible,
    title,
    textLabel,
    confirmLabel,
    pending = false,
    onAbort,
    onConfirm,
}: Props) {
    const [text, setText] = useState('');
    const valid = text.trim().length > 0;

    return (
        <Dialog
            visible={visible}
            modal
            dismissableMask={false}
            closable={false}
            closeOnEscape={!pending}
            draggable={false}
            resizable={false}
            header={<h2 className='review-dialog__heading'>{title}</h2>}
            pt={{
                root: { className: 'review-dialog review-dialog--text' },
                header: { className: 'review-dialog__header' },
                content: { className: 'review-dialog__content' },
            }}
            onHide={onAbort}>
            <form
                className='review-dialog__form'
                onSubmit={(event) => {
                    event.preventDefault();
                    if (valid) void onConfirm(text.trim());
                }}>
                <p>The backend records the author from the authenticated session.</p>
                <label htmlFor='review-dialog-text'>{textLabel}</label>
                <textarea
                    id='review-dialog-text'
                    rows={6}
                    value={text}
                    disabled={pending}
                    onChange={(event) => setText(event.currentTarget.value)}
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
                        label={confirmLabel}
                        disabled={!valid || pending}
                        pt={{ root: { className: 'review-dialog__button review-dialog__button--confirm' } }}
                    />
                </div>
            </form>
        </Dialog>
    );
}
