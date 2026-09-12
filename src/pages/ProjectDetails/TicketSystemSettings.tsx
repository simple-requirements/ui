import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { updateProjectTicketUrlTemplateRequest, type Project } from '@/api/projectsApi';
import { queryClient } from '@/api/queryClient';
import { getListProjectsQueryKey } from '@/api/generated/projects/projects';
import { toastMessages } from '@/components/Feedback/AppToast/toastMessages';
import { showToastMessage } from '@/stores/toastStore';

export function TicketSystemSettings({ project }: Readonly<{ project: Project }>) {
    const [value, setValue] = useState(project.ticketUrlTemplate ?? '');
    const [pending, setPending] = useState(false);
    async function save(): Promise<void> {
        setPending(true);
        try {
            await updateProjectTicketUrlTemplateRequest(project.id, value.trim() === '' ? null : value.trim());
            await queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
            showToastMessage(toastMessages.ticketSystemSettingsSaved());
        } catch (error) {
            showToastMessage(
                toastMessages.implementationActionFailed(
                    error instanceof Error ? error.message : 'The settings could not be saved.',
                ),
            );
        } finally {
            setPending(false);
        }
    }
    return (
        <section
            className='project-details-page__ticket-settings'
            aria-labelledby='ticket-system-settings-title'>
            <h2 id='ticket-system-settings-title'>Ticket system</h2>
            <label htmlFor='ticket-url-template'>Ticket URL template</label>
            <div>
                <InputText
                    id='ticket-url-template'
                    value={value}
                    placeholder='https://github.com/xxx/{ticket-id}'
                    onChange={(event) => setValue(event.currentTarget.value)}
                />
                <Button
                    type='button'
                    label='Save'
                    loading={pending}
                    onClick={() => void save()}
                />
            </div>
            <small>Use the placeholder {'{ticket-id}'} exactly once.</small>
        </section>
    );
}
