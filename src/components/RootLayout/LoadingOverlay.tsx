import { useQuery } from '@tanstack/react-query';
import { Button } from 'primereact/button';

import { getListProjectsQueryKey } from '@/api/generated/projects/projects';
import { listProjectsRequest } from '@/api/projectsApi';
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout';

import '@/components/RootLayout/LoadingOverlay.scss';

const LOADING_TIMEOUT_MS = 10_000;

export function LoadingOverlay() {
    const projectsQuery = useQuery({
        queryKey: getListProjectsQueryKey(),
        queryFn: listProjectsRequest,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const projectsLoaded = projectsQuery.data !== undefined;
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
                            pt={{ root: { className: 'loading-overlay__button' } }}
                        />
                    </>
                :   <p className='loading-overlay__message'>SRM is loading ...</p>}
            </div>
        </div>
    );
}
