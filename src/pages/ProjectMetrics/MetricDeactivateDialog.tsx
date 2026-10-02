import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import type { Metric } from '@/api/metricsApi';

export type MetricDeactivateDialogProps = Readonly<{
    metric: Metric | undefined;
    pending: boolean;
    onAbort: () => void;
    onConfirm: () => void;
}>;

export function MetricDeactivateDialog({ metric, pending, onAbort, onConfirm }: MetricDeactivateDialogProps) {
    return (
        <Dialog
            visible={metric !== undefined}
            modal
            dismissableMask={false}
            closable={false}
            closeOnEscape={!pending}
            draggable={false}
            resizable={false}
            header={<h2 className='ui-dialog__heading'>Deactivate metric</h2>}
            pt={{
                root: { className: 'ui-dialog ui-dialog--compact' },
                header: { className: 'ui-dialog__header' },
                content: { className: 'ui-dialog__content' },
            }}
            onHide={onAbort}>
            <p className='ui-dialog__message'>
                Deactivate {metric?.key ?? 'this metric'}? Existing requirement references remain valid.
            </p>
            <div className='ui-dialog__actions'>
                <Button
                    outlined
                    type='button'
                    label='Abort'
                    disabled={pending}
                    pt={{ root: { className: 'ui-button ui-button--outline ui-button--dialog' } }}
                    onClick={onAbort}
                />
                <Button
                    type='button'
                    label='Deactivate'
                    disabled={pending}
                    loading={pending}
                    pt={{ root: { className: 'ui-button ui-button--primary ui-button--dialog' } }}
                    onClick={onConfirm}
                />
            </div>
        </Dialog>
    );
}
