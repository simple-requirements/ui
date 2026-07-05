import { CategoriesActionBar } from '@/components/RootLayout/ActionBar/CategoriesActionBar';
import { RequirementLookupActionBar } from '@/components/RootLayout/ActionBar/RequirementLookupActionBar';
import { useRouteUiMetadata } from '@/router/routeUiMetadata';

export function ActionBarOutlet() {
    const routeUiMetadata = useRouteUiMetadata();

    if (routeUiMetadata.actionBar === 'categories') {
        return <CategoriesActionBar />;
    }

    if (routeUiMetadata.actionBar === 'categoryForm') {
        return <CategoriesActionBar disabled />;
    }

    return <RequirementLookupActionBar />;
}
