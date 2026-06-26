import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { mapApiError } from '@/api/errors/apiError';
import { useExportDownloadMutation, useExportFormatsQuery } from '@/features/exports/api/exportQueries';
import { supportedFormatsForScope, type ExportScope } from '@/features/exports/api/exportsApi';

export type ExportDialogRequest = Readonly<{
    scope: ExportScope;
    title: string;
    description: string;
    projectId?: string | null;
    requirementIds?: readonly string[];
}>;

type ExportControlsProps = Readonly<{ request: ExportDialogRequest | null; visible: boolean; onHide: () => void }>;

function describeFormatClass(formatClass: string) {
    return formatClass === 'document' ? 'Document' : 'Data';
}

/** Renders the backend-supported export format controls inside the context-menu initiated export dialog. */
export function ExportControls({ request, visible, onHide }: ExportControlsProps) {
    const formatsQuery = useExportFormatsQuery();
    const downloadMutation = useExportDownloadMutation();
    const [formatId, setFormatId] = useState('');
    const [message, setMessage] = useState<string | null>(null);

    const supportedFormats = useMemo(
        () => (request ? supportedFormatsForScope(formatsQuery.data ?? [], request.scope) : []),
        [formatsQuery.data, request],
    );

    useEffect(() => {
        if (!visible) {
            setMessage(null);
            return;
        }
        if (supportedFormats.length === 0) {
            setFormatId('');
            return;
        }
        if (!supportedFormats.some((format) => format.id === formatId)) setFormatId(supportedFormats[0].id);
    }, [formatId, supportedFormats, visible]);

    const handleExport = async () => {
        if (!request) return;
        setMessage(null);
        if (!formatId) {
            setMessage('No backend export format currently supports this export scope.');
            return;
        }

        try {
            await downloadMutation.mutateAsync({
                scope: request.scope,
                formatId,
                projectId: request.projectId,
                requirementIds: request.requirementIds,
            });
            setMessage('Export download started.');
        } catch (error) {
            setMessage(mapApiError(error).message);
        }
    };

    const footer = (
        <div className='form__actions export-dialog__actions'>
            <Button
                type='button'
                label='Cancel'
                severity='danger'
                onClick={onHide}
            />
            <Button
                type='button'
                label='Refresh formats'
                severity='info'
                outlined
                disabled={formatsQuery.isFetching}
                onClick={() => void formatsQuery.refetch()}
            />
            <Button
                type='button'
                label='Export'
                severity='success'
                disabled={!formatId || downloadMutation.isPending}
                loading={downloadMutation.isPending}
                onClick={() => void handleExport()}
            />
        </div>
    );

    return (
        <Dialog
            className='export-dialog'
            header={request?.title ?? 'Export'}
            visible={visible}
            modal
            onHide={onHide}
            footer={footer}
            style={{ width: 'min(42rem, calc(100vw - 2rem))' }}>
            {request ?
                <section aria-label='Export settings'>
                    <p>{request.description}</p>
                    <p>
                        Choose one of the formats advertised by the backend export registry. JSON, GitHub Markdown, and
                        AsciiDoc are available when the backend exposes them.
                    </p>

                    {formatsQuery.isLoading || formatsQuery.isFetching ?
                        <p role='status'>Loading export formats…</p>
                    :   null}
                    {formatsQuery.isError ?
                        <p
                            className='form__error'
                            role='alert'>
                            {mapApiError(formatsQuery.error).message}
                        </p>
                    :   null}

                    {!formatsQuery.isLoading && !formatsQuery.isError ?
                        <form
                            className='form export-form export-dialog__form'
                            onSubmit={(event) => {
                                event.preventDefault();
                                void handleExport();
                            }}>
                            <div className='form__field'>
                                <label htmlFor='export-format'>Format</label>
                                <select
                                    id='export-format'
                                    name='format'
                                    value={formatId}
                                    disabled={supportedFormats.length === 0}
                                    onChange={(event) => setFormatId(event.currentTarget.value)}>
                                    {supportedFormats.map((format) => (
                                        <option
                                            key={format.id}
                                            value={format.id}>
                                            {format.label} ({format.fileExtension},{' '}
                                            {describeFormatClass(format.formatClass)})
                                        </option>
                                    ))}
                                </select>
                                {supportedFormats.length === 0 ?
                                    <small>No discovered backend format supports this scope.</small>
                                :   null}
                            </div>

                            {supportedFormats.length ?
                                <ul className='export-form__format-list'>
                                    {supportedFormats.map((format) => (
                                        <li key={format.id}>
                                            <strong>{format.label}</strong> — <code>{format.id}</code>,{' '}
                                            {format.mediaType}
                                        </li>
                                    ))}
                                </ul>
                            :   null}

                            <p
                                role='status'
                                aria-live='polite'>
                                {message}
                            </p>
                        </form>
                    :   null}
                </section>
            :   null}
        </Dialog>
    );
}
