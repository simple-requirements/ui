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
            <label>
                Project name
                <InputText
                    name='name'
                    required
                />
            </label>
            {error ?
                <p
                    id='project-form-error'
                    className='form__error'>
                    {error}
                </p>
            :   null}
            <Button
                type='submit'
                label='Create'
                disabled={pending}
            />
            <Button
                type='button'
                label='Cancel'
                onClick={onCancel}
            />
        </form>
    );
}
