import type { ReactNode } from 'react';

export type RequirementDetailsRowProps = Readonly<{ label: string; children: ReactNode }>;

export function RequirementDetailsRow({ label, children }: RequirementDetailsRowProps) {
    return (
        <div className='requirement-details-panel__details-row'>
            <dt>{label}</dt>
            <dd>{children}</dd>
        </div>
    );
}
