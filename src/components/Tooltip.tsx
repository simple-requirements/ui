import type { ReactElement } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

import '@/components/Tooltip.scss';

export const DEFAULT_TOOLTIP_SHOW_DELAY_MS = 1_000;

export type TooltipTriggerProps = Readonly<{
    'aria-describedby'?: string;
    'onMouseEnter': () => void;
    'onMouseLeave': () => void;
    'onFocus': () => void;
    'onBlur': () => void;
}>;

type Props = Readonly<{
    content: string;
    children: (triggerProps: TooltipTriggerProps) => ReactElement;
    delayMs?: number;
}>;

export function Tooltip({ content, children, delayMs = DEFAULT_TOOLTIP_SHOW_DELAY_MS }: Props) {
    const tooltipId = useId();
    const timeoutRef = useRef<number | undefined>(undefined);
    const [visible, setVisible] = useState(false);

    function clearTooltipTimeout(): void {
        if (timeoutRef.current === undefined) {
            return;
        }

        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
    }

    function showTooltipDelayed(): void {
        clearTooltipTimeout();

        timeoutRef.current = window.setTimeout(() => {
            timeoutRef.current = undefined;
            setVisible(true);
        }, delayMs);
    }

    function hideTooltip(): void {
        clearTooltipTimeout();
        setVisible(false);
    }

    useEffect(() => {
        return () => {
            clearTooltipTimeout();
        };
    }, []);

    return (
        <span className='tooltip'>
            {children({
                'aria-describedby': visible ? tooltipId : undefined,
                'onMouseEnter': showTooltipDelayed,
                'onMouseLeave': hideTooltip,
                'onFocus': showTooltipDelayed,
                'onBlur': hideTooltip,
            })}

            {visible && (
                <span
                    id={tooltipId}
                    role='tooltip'
                    className='tooltip__content'>
                    {content}
                </span>
            )}
        </span>
    );
}
