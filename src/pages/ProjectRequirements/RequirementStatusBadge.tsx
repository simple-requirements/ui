import { Badge } from 'primereact/badge';

import type { RequirementStatus } from '@/api/requirementsApi';
import { formatStatus } from '@/pages/ProjectRequirements/List/requirementFormatters';

import '@/pages/ProjectRequirements/RequirementStatusBadge.scss';

export type RequirementStatusBadgeProps = Readonly<{ status: RequirementStatus }>;

export function RequirementStatusBadge({ status }: RequirementStatusBadgeProps) {
    return (
        <Badge
            value={formatStatus(status)}
            pt={{ root: { className: `requirement-status-badge requirement-status-badge--${status}` } }}
        />
    );
}
