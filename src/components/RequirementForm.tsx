import type { SyntheticEvent } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import type { Category } from '@/demo/demoTypes';

type RequirementFormProps = Readonly<{
    categories: readonly Category[];
    onSubmit: (formData: FormData) => void;
    onCancel: () => void;
}>;

const priorityOptions = ['P1', 'P2', 'P3', 'P4'];

export function RequirementForm({ categories, onSubmit, onCancel }: RequirementFormProps) {
    function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
    }

    return (
        <form className="form" onSubmit={handleSubmit}>
            <h2>New requirement</h2>
            <label>
                Category
                <Dropdown
                    name="category"
                    options={[...categories]}
                    optionLabel="name"
                    optionValue="key"
                    itemTemplate={(category: Category) => `${category.key} — ${category.name} (${category.type})`}
                    value={categories[0]?.key ?? null}
                />
            </label>
            <label>
                Description
                <InputTextarea name="description" required />
            </label>
            <label>
                Priority
                <Dropdown name="priority" options={priorityOptions} value="P1" />
            </label>
            <label>
                Owner
                <InputText name="owner" />
            </label>
            <label>
                Rationale
                <InputText name="rationale" />
            </label>
            <label>
                Source
                <InputText name="source" />
            </label>
            <Button type="submit" label="Create" />
            <Button type="button" label="Cancel" onClick={onCancel} />
        </form>
    );
}
