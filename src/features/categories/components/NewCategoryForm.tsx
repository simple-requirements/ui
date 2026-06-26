import type { SyntheticEvent } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import type { FormSubmitHandler } from '@/shared/forms/formData';

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
            className='form category-form'
            onSubmit={handleSubmit}
            aria-describedby={error ? 'category-form-error' : undefined}>
            <h2>New Category</h2>
            <div className='form__field'>
                <label htmlFor='category-key'>Category key</label>
                <InputText
                    id='category-key'
                    name='key'
                    required
                    pattern='[A-Z][A-Z0-9_]*'
                />
            </div>
            <div className='form__field'>
                <label htmlFor='category-name'>Category name</label>
                <InputText
                    id='category-name'
                    name='name'
                    required
                />
            </div>
            <fieldset className='form__fieldset'>
                <legend>Category type</legend>
                <div className='form__radio-option'>
                    <RadioButton
                        inputId='category-type-fr'
                        name='type'
                        value='FR'
                        defaultChecked
                    />
                    <label htmlFor='category-type-fr'>Functional (FR)</label>
                </div>
                <div className='form__radio-option'>
                    <RadioButton
                        inputId='category-type-nfr'
                        name='type'
                        value='NFR'
                    />
                    <label htmlFor='category-type-nfr'>Non-functional (NFR)</label>
                </div>
            </fieldset>
            {error ?
                <p
                    id='category-form-error'
                    className='form__error'
                    role='alert'>
                    {error}
                </p>
            :   null}
            <div className='form__actions'>
                <Button
                    type='submit'
                    label='Create'
                    severity='success'
                    disabled={pending}
                    loading={pending}
                />
                <Button
                    type='button'
                    label='Cancel'
                    severity='danger'
                    onClick={onCancel}
                    disabled={pending}
                />
            </div>
        </form>
    );
}
