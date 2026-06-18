import type { SyntheticEvent } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import type { FormSubmitHandler } from '@/components/NewProjectForm';

type NewCategoryFormProps = Readonly<{
    error: string | null;
    pending: boolean;
    onSubmit: FormSubmitHandler;
    onCancel: () => void;
}>;

/** Renders category creation with exactly one backend-supported type: FR or NFR. */
export function NewCategoryForm({ error, pending, onSubmit, onCancel }: NewCategoryFormProps) {
    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
    };

    return (
        <form
            className='form'
            onSubmit={handleSubmit}
            aria-describedby={error ? 'category-form-error' : undefined}>
            <h2>New Category</h2>
            <label>
                Category key
                <InputText
                    name='key'
                    required
                    pattern='[A-Z][A-Z0-9_]*'
                />
            </label>
            <label>
                Category name
                <InputText
                    name='name'
                    required
                />
            </label>
            <label>
                <input
                    type='radio'
                    name='type'
                    value='FR'
                    defaultChecked
                />{' '}
                Functional (FR)
            </label>
            <label>
                <input
                    type='radio'
                    name='type'
                    value='NFR'
                />{' '}
                Non-functional (NFR)
            </label>
            {error ?
                <p
                    id='category-form-error'
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
