import { useQuery } from '@tanstack/react-query';
import { Button } from 'primereact/button';

import { getListProjectsQueryKey } from '@/api/projectsApi';
import { listProjectsRequest } from '@/api/projectsApi';
import { useIsAdministrator } from '@/auth/projectPermissions';
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout';

import '@/components/RootLayout/LoadingOverlay.scss';

const LOADING_TIMEOUT_MS = 10_000;

export function LoadingOverlay() {
    const administrator = useIsAdministrator();
    // Direct Query is intentional here: the shell needs request lifecycle, retry, and error state.
    const projectsQuery = useQuery({
        queryKey: getListProjectsQueryKey(),
        queryFn: listProjectsRequest,
        retry: false,
        refetchOnWindowFocus: false,
        enabled: !administrator,
    });

    const projectsLoaded = administrator || projectsQuery.data !== undefined;
    const loadingTimeout = useLoadingTimeout({ active: !projectsLoaded, timeoutMs: LOADING_TIMEOUT_MS });

    const networkErrorVisible = !projectsLoaded && (projectsQuery.isError || loadingTimeout.timedOut);
    const loadingVisible = !projectsLoaded && !networkErrorVisible;

    function handleReload(): void {
        loadingTimeout.reset();

        void projectsQuery.refetch();
    }

    if (projectsLoaded) {
        return null;
    }

    return (
        <div
            className='loading-overlay'
            role={networkErrorVisible ? 'alert' : 'status'}
            aria-live={networkErrorVisible ? 'assertive' : 'polite'}
            aria-busy={loadingVisible}>
            <div className='loading-overlay__panel'>
                {networkErrorVisible ?
                    <>
                        <p className='loading-overlay__message'>A network error has occured. Try again.</p>

                        <Button
                            type='button'
                            label='Reload'
                            onClick={handleReload}
                            pt={{ root: { className: 'ui-button ui-button--primary loading-overlay__button' } }}
                        />
                    </>
                :   <p className='loading-overlay__message'>SRM is loading ...</p>}
            </div>
        </div>
    );
}
