import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RequirementLifecycleDialog } from '@/pages/ProjectRequirements/RequirementLifecycleDialog';

afterEach(cleanup);

describe('RequirementLifecycleDialog', () => {
    it('requires a reason when configured for rejection or obsolescence.', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        render(
            <RequirementLifecycleDialog
                visible
                title='Mark requirement obsolete'
                reasonRequired
                onAbort={vi.fn()}
                onConfirm={onConfirm}
            />,
        );

        const okButton = screen.getByRole('button', { name: 'OK' });
        expect(okButton).toBeDisabled();
        expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument();
        await user.type(screen.getByRole('textbox', { name: 'Reason' }), 'Superseded.');
        await user.click(okButton);

        expect(onConfirm).toHaveBeenCalledWith('Superseded.');
    });

    it('supports approval without collecting a reviewer name.', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        render(
            <RequirementLifecycleDialog
                visible
                title='Approve requirement'
                onAbort={vi.fn()}
                onConfirm={onConfirm}
            />,
        );

        expect(screen.queryByRole('textbox', { name: 'Reviewer' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'OK' }));

        expect(onConfirm).toHaveBeenCalledWith(undefined);
    });
});
