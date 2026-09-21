import '@testing-library/jest-dom/vitest';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_TOOLTIP_SHOW_DELAY_MS, Tooltip } from '@/components/Tooltip';

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
});

describe('Tooltip', () => {
    describe('renders', () => {
        it('the tooltip after hovering for the configured delay.', () => {
            vi.useFakeTimers();

            render(
                <Tooltip content='Reporting and Analytics'>
                    {(tooltipTriggerProps) => (
                        <button
                            type='button'
                            {...tooltipTriggerProps}>
                            Project
                        </button>
                    )}
                </Tooltip>,
            );

            fireEvent.mouseEnter(screen.getByRole('button', { name: /project/i }));

            act(() => {
                vi.advanceTimersByTime(DEFAULT_TOOLTIP_SHOW_DELAY_MS - 1);
            });

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

            act(() => {
                vi.advanceTimersByTime(1);
            });

            expect(screen.getByRole('tooltip')).toHaveTextContent('Reporting and Analytics');
        });

        it('the tooltip after focusing for the configured delay.', () => {
            vi.useFakeTimers();

            render(
                <Tooltip content='Reporting and Analytics'>
                    {(tooltipTriggerProps) => (
                        <button
                            type='button'
                            {...tooltipTriggerProps}>
                            Project
                        </button>
                    )}
                </Tooltip>,
            );

            fireEvent.focus(screen.getByRole('button', { name: /project/i }));

            act(() => {
                vi.advanceTimersByTime(DEFAULT_TOOLTIP_SHOW_DELAY_MS);
            });

            expect(screen.getByRole('tooltip')).toHaveTextContent('Reporting and Analytics');
        });
    });

    describe('shows / hides', () => {
        it('does not show the tooltip when hovering ends before the delay.', () => {
            vi.useFakeTimers();

            render(
                <Tooltip content='Reporting and Analytics'>
                    {(tooltipTriggerProps) => (
                        <button
                            type='button'
                            {...tooltipTriggerProps}>
                            Project
                        </button>
                    )}
                </Tooltip>,
            );

            const button = screen.getByRole('button', { name: /project/i });

            fireEvent.mouseEnter(button);

            act(() => {
                vi.advanceTimersByTime(DEFAULT_TOOLTIP_SHOW_DELAY_MS - 1);
            });

            fireEvent.mouseLeave(button);

            act(() => {
                vi.advanceTimersByTime(1);
            });

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });

        it('hides the tooltip when hovering ends.', () => {
            vi.useFakeTimers();

            render(
                <Tooltip content='Reporting and Analytics'>
                    {(tooltipTriggerProps) => (
                        <button
                            type='button'
                            {...tooltipTriggerProps}>
                            Project
                        </button>
                    )}
                </Tooltip>,
            );

            const button = screen.getByRole('button', { name: /project/i });

            fireEvent.mouseEnter(button);

            act(() => {
                vi.advanceTimersByTime(DEFAULT_TOOLTIP_SHOW_DELAY_MS);
            });

            expect(screen.getByRole('tooltip')).toBeInTheDocument();

            fireEvent.mouseLeave(button);

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });
    });
});
