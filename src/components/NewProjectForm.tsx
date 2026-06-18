import type { SyntheticEvent } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

export type FormSubmitHandler = (formData: FormData) => void;

type NewProjectFormProps = Readonly<{
    error: string | null;
    pending: boolean;
    onSubmit: FormSubmitHandler;
    onCancel: () => void;
}>;

/** Renders the backend-backed project creation form and keeps validation errors in the right pane. */
export function NewProjectForm({ error, pending, onSubmit, onCancel }: NewProjectFormProps) {
    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
    };

    return (
        <form
            className='form'
            onSubmit={handleSubmit}
            aria-describedby={error ? 'project-form-error' : undefined}>
            <h2>New Project</h2>
            <div className='form__field'>
                <label htmlFor='project-name'>Project name</label>
                <InputText
                    id='project-name'
                    name='name'
                    required
                />
            </div>
            {error ?
                <p
                    id='project-form-error'
                    className='form__error'
                    role='alert'>
                    {error}
                </p>
            :   null}
            <div className='form__actions'>
                <Button
                    type='submit'
                    label='Create'
                    disabled={pending}
                    loading={pending}
                />
                <Button
                    type='button'
                    label='Cancel'
                    outlined
                    onClick={onCancel}
                    disabled={pending}
                />
            </div>
        </form>
    );
}
