import type { ReactNode } from 'react';

import '@/components/RootLayout/ActionBar/ActionBar.scss';

export type ActionBarProps = Readonly<{ label: string; children: ReactNode }>;

export function ActionBar({ label, children }: ActionBarProps) {
    return (
        <section
            className='action-bar'
            aria-label={label}>
            {children}
        </section>
    );
}
