import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { LoadableContent } from '@/components/Feedback/LoadableContent';

type RenderLoadableContentOptions = Readonly<{
    loading?: boolean;
    error?: boolean;
    empty?: boolean;
    emptyMessage?: string;
}>;

function renderLoadableContent(options: RenderLoadableContentOptions = {}): ReturnType<typeof render> {
    return render(
        <LoadableContent
            loading={options.loading ?? false}
            error={options.error ?? false}
            empty={options.empty ?? false}
            loadingMessage='Loading categories …'
            errorMessage='Categories could not be loaded.'
            emptyMessage={options.emptyMessage}>
            <div>Loaded content</div>
        </LoadableContent>,
    );
}

afterEach(() => {
    cleanup();
});

describe('LoadableContent', () => {
    it('renders the loading message first.', () => {
        renderLoadableContent({ loading: true, error: true, empty: true });

        expect(screen.getByRole('status')).toHaveTextContent('Loading categories …');
        expect(screen.queryByText('Loaded content')).not.toBeInTheDocument();
    });

    it('renders the error message when loading is false and error is true.', () => {
        renderLoadableContent({ error: true, empty: true });

        expect(screen.getByRole('alert')).toHaveTextContent('Categories could not be loaded.');
        expect(screen.queryByText('Loaded content')).not.toBeInTheDocument();
    });

    it('renders the configured empty message.', () => {
        renderLoadableContent({ empty: true, emptyMessage: 'No categories available.' });

        expect(screen.getByRole('status')).toHaveTextContent('No categories available.');
        expect(screen.queryByText('Loaded content')).not.toBeInTheDocument();
    });

    it('renders the children when loading, error, and empty are false.', () => {
        renderLoadableContent();

        expect(screen.getByText('Loaded content')).toBeInTheDocument();
    });
});
