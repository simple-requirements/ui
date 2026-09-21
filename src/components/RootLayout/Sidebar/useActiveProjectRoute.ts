import { useMemo } from 'react';
import { useLocation } from 'react-router';

import { getActiveProjectRoute, type ActiveProjectRoute } from '@/router/projectRoutes';

export function useActiveProjectRoute(): ActiveProjectRoute {
    const location = useLocation();

    return useMemo(() => getActiveProjectRoute(location.pathname), [location.pathname]);
}
