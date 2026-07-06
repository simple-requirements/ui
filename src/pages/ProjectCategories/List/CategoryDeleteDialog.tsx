import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import type { CategoryTableRow } from '@/pages/ProjectCategories/List/categoryListTypes';

import '@/pages/ProjectCategories/List/CategoryDeleteDialog.scss';

export type CategoryDeleteDialogProps = Readonly<{
    category: CategoryTableRow | undefined;
    pending: boolean;
    onAbort: () => void;
    onConfirm: () => void;
}>;

export function CategoryDeleteDialog({ category, pending, onAbort, onConfirm }: CategoryDeleteDialogProps) {
    const visible = category !== undefined;
    const categoryName = category?.name ?? '';

    return (
        <Dialog
            visible={visible}
            modal
            dismissableMask={false}
            closable={false}
            closeOnEscape={!pending}
            draggable={false}
            resizable={false}
            header={<h2 className='category-delete-dialog__heading'>Delete category</h2>}
            pt={{
                root: { className: 'category-delete-dialog' },
                header: { className: 'category-delete-dialog__header' },
                content: { className: 'category-delete-dialog__content' },
            }}
            onHide={onAbort}>
            <p className='category-delete-dialog__message'>Do you really want to delete {categoryName}?</p>

            <div className='category-delete-dialog__actions'>
                <Button
                    outlined
                    type='button'
                    label='Abort'
                    disabled={pending}
                    pt={{ root: { className: 'category-delete-dialog__button category-delete-dialog__button--abort' } }}
                    onClick={onAbort}
                />

                <Button
                    type='button'
                    label='OK'
                    disabled={pending}
                    pt={{ root: { className: 'category-delete-dialog__button category-delete-dialog__button--ok' } }}
                    onClick={onConfirm}
                />
            </div>
        </Dialog>
    );
}
