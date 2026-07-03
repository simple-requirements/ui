import type { ReactNode } from 'react';

import '@/components/Feedback/InlineStatus.scss';

export type InlineStatusKind = 'loading' | 'error' | 'empty' | 'info';

export type InlineStatusProps = Readonly<{ children: ReactNode; kind?: InlineStatusKind }>;

function getInlineStatusClassName(kind: InlineStatusKind): string {
    return `inline-status inline-status--${kind}`;
}

export function InlineStatus({ children, kind = 'info' }: InlineStatusProps) {
    const role = kind === 'error' ? 'alert' : 'status';
    const ariaLive = kind === 'error' ? 'assertive' : 'polite';

    return (
        <p
            className={getInlineStatusClassName(kind)}
            role={role}
            aria-live={ariaLive}>
            {children}
        </p>
    );
}
