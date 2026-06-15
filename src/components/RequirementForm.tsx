import type { SyntheticEvent } from 'react';
import type { Category } from '@/demo/demoTypes';

interface RequirementFormProps {
    categories: readonly Category[];
    onSubmit: (formData: FormData) => void;
    onCancel: () => void;
}

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
                <select name="category">
                    {categories.map((category) => (
                        <option key={category.key} value={category.key}>
                            {category.key} — {category.name} ({category.type})
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Description
                <textarea name="description" required />
            </label>
            <label>
                Priority
                <select name="priority">
                    <option>P1</option>
                    <option>P2</option>
                    <option>P3</option>
                    <option>P4</option>
                </select>
            </label>
            <label>
                Owner
                <input name="owner" />
            </label>
            <label>
                Rationale
                <input name="rationale" />
            </label>
            <label>
                Source
                <input name="source" />
            </label>
            <button>Create</button>
            <button type="button" onClick={onCancel}>
                Cancel
            </button>
        </form>
    );
}
