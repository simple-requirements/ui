import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Category } from '@/api/categoriesApi';
import { CategoryDetailsPanel } from '@/pages/ProjectCategories/CategoryDetailsPanel';

const category: Category = {
    id: '11111111-1111-4111-8111-111111111111',
    projectId: '22222222-2222-4222-8222-222222222222',
    name: 'Authentication',
    key: 'AUTH',
    type: 'FR',
    createdAt: '2026-06-28T10:00:00.000Z',
    updatedAt: '2026-06-29T11:30:00.000Z',
    requirementCount: 3,
};

afterEach(() => {
    cleanup();
});

describe('CategoryDetailsPanel', () => {
    it('renders the empty message when no category is selected.', () => {
        render(<CategoryDetailsPanel title='Category details' />);

        expect(screen.getByRole('heading', { name: 'Category details', level: 2 })).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Select a category to show its details.');
    });

    it('renders the category fields.', () => {
        render(
            <CategoryDetailsPanel
                category={category}
                title='Category AUTH'
                titleElement='h1'
                titleId='category-heading'
            />,
        );

        expect(screen.getByRole('heading', { name: 'Category AUTH', level: 1 })).toHaveAttribute(
            'id',
            'category-heading',
        );
        expect(screen.getByText('Authentication')).toBeInTheDocument();
        expect(screen.getByText('AUTH')).toBeInTheDocument();
        expect(screen.getByText('FR')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });
});
