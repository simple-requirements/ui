import { useQuery } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useMemo, useState } from 'react';

import { downloadProjectExportRequest, listExportFormatsRequest } from '@/api/exportApi';
import { InlineStatus } from '@/components/Feedback/InlineStatus';

import '@/components/RootLayout/Sidebar/ProjectExportDialog.scss';

type Props = Readonly<{ projectId?: string; projectName?: string; visible: boolean; onClose: () => void }>;

export function ProjectExportDialog({ projectId, projectName, visible, onClose }: Props) {
    const formatsQuery = useQuery({
        queryKey: ['export', 'formats'],
        queryFn: listExportFormatsRequest,
        enabled: visible,
    });
    const formats = useMemo(
        () => (formatsQuery.data ?? []).filter((format) => format.capabilities.project),
        [formatsQuery.data],
    );
    const [formatId, setFormatId] = useState('json');
    const [pending, setPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    useEffect(() => {
        if (!visible) return;
        setFormatId(formats.some((format) => format.id === 'json') ? 'json' : (formats[0]?.id ?? 'json'));
        setErrorMessage(undefined);
    }, [formats, visible]);

    async function handleExport(): Promise<void> {
        if (projectId === undefined) return;
        setPending(true);
        setErrorMessage(undefined);
        try {
            await downloadProjectExportRequest(projectId, formatId);
            onClose();
        } catch {
            setErrorMessage('Project export could not be created.');
        } finally {
            setPending(false);
        }
    }

    const options = formats.map((format) => ({ label: format.label, value: format.id }));

    return (
        <Dialog
            visible={visible}
            modal
            draggable={false}
            resizable={false}
            header={<h2 className='project-export-dialog__heading ui-dialog__heading'>Export project</h2>}
            pt={{
                root: { className: 'project-export-dialog ui-dialog' },
                content: { className: 'ui-dialog__content' },
            }}
            onHide={() => !pending && onClose()}>
            <div className='project-export-dialog__body'>
                <p>
                    Export {projectName ?? 'the selected project'} with its requirements, revisions, metrics, and links.
                </p>
                {formatsQuery.isError && <InlineStatus kind='error'>Export formats could not be loaded.</InlineStatus>}
                {errorMessage !== undefined && <InlineStatus kind='error'>{errorMessage}</InlineStatus>}
                <label htmlFor='project-export-format'>Format</label>
                <Dropdown
                    inputId='project-export-format'
                    value={formatId}
                    options={options}
                    disabled={pending || formats.length === 0}
                    pt={{ root: { className: 'ui-control' } }}
                    onChange={(event) => {
                        if (typeof event.value === 'string') setFormatId(event.value);
                    }}
                />
                <div className='project-export-dialog__actions'>
                    <Button
                        type='button'
                        label='Cancel'
                        outlined
                        disabled={pending}
                        pt={{ root: { className: 'ui-button ui-button--outline ui-button--action' } }}
                        onClick={onClose}
                    />
                    <Button
                        type='button'
                        label={pending ? 'Exporting…' : 'Export'}
                        disabled={pending || projectId === undefined || formats.length === 0}
                        pt={{ root: { className: 'ui-button ui-button--action' } }}
                        onClick={() => void handleExport()}
                    />
                </div>
            </div>
        </Dialog>
    );
}
