import { useId } from 'react';

import { normalizeProjectRoles, projectRoleOptions } from '@/auth/projectRoleMetadata';
import type { ProjectRole } from '@/auth/authTypes';

type RoleSelectionProps = Readonly<{
    legend: string;
    roles: readonly ProjectRole[];
    disabled: boolean;
    onChange: (roles: ProjectRole[]) => void;
}>;

export function RoleSelection({ legend, roles, disabled, onChange }: RoleSelectionProps) {
    const id = useId();

    function toggleRole(role: ProjectRole): void {
        const nextRoles = roles.includes(role) ? roles.filter((candidate) => candidate !== role) : [...roles, role];
        onChange(normalizeProjectRoles(nextRoles));
    }

    return (
        <fieldset
            className='project-memberships__roles'
            disabled={disabled}>
            <legend>{legend}</legend>
            {projectRoleOptions.map((option) => {
                const inputId = `${id}-${option.value}`;

                return (
                    <label
                        key={option.value}
                        htmlFor={inputId}>
                        <input
                            id={inputId}
                            type='checkbox'
                            value={option.value}
                            checked={roles.includes(option.value)}
                            onChange={() => toggleRole(option.value)}
                        />
                        {option.label}
                    </label>
                );
            })}
        </fieldset>
    );
}
