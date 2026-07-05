import { Button } from 'primereact/button';
import { useNavigate, useParams } from 'react-router';

import { RequirementLookupActionBar } from '@/components/RootLayout/ActionBar/RequirementLookupActionBar';
import { getProjectCategoryCreateRoute } from '@/router/projectRoutes';

export type CategoriesActionBarProps = Readonly<{ disabled?: boolean }>;

export function CategoriesActionBar({ disabled = false }: CategoriesActionBarProps) {
    const navigate = useNavigate();
    const { projectId } = useParams();

    function handleCreateCategory(): void {
        if (projectId === undefined) {
            return;
        }

        void navigate(getProjectCategoryCreateRoute(projectId));
    }

    return (
        <RequirementLookupActionBar disabled={disabled}>
            <Button
                type='button'
                label='Create'
                disabled={disabled || projectId === undefined}
                onClick={handleCreateCategory}
                pt={{ root: { className: 'action-bar__button' } }}
            />
        </RequirementLookupActionBar>
    );
}
