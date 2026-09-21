import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { InlineStatus } from '@/components/Feedback/InlineStatus';

afterEach(() => {
    cleanup();
});

describe('InlineStatus', () => {
    it('renders non-error messages as polite status messages.', () => {
        render(<InlineStatus kind='loading'>Loading data …</InlineStatus>);

        const status = screen.getByRole('status');

        expect(status).toHaveTextContent('Loading data …');
        expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('renders error messages as assertive alerts.', () => {
        render(<InlineStatus kind='error'>Data could not be loaded.</InlineStatus>);

        const alert = screen.getByRole('alert');

        expect(alert).toHaveTextContent('Data could not be loaded.');
        expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
});
