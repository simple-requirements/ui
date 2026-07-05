import { useMatches } from 'react-router';

export type ActionBarKind = 'requirements' | 'categories' | 'categoryForm';

export type RouteUiHandle = Readonly<{
    actionBar?: ActionBarKind;
    disableChromeActions?: boolean;
}>;

export type RouteUiMetadata = Readonly<{
    actionBar: ActionBarKind;
    disableChromeActions: boolean;
}>;

function isRouteUiHandle(value: unknown): value is RouteUiHandle {
    return typeof value === 'object' && value !== null;
}

function mergeRouteUiMetadata(handles: readonly RouteUiHandle[]): RouteUiMetadata {
    return handles.reduce<RouteUiMetadata>(
        (metadata, handle) => ({
            actionBar: handle.actionBar ?? metadata.actionBar,
            disableChromeActions: handle.disableChromeActions ?? metadata.disableChromeActions,
        }),
        { actionBar: 'requirements', disableChromeActions: false },
    );
}

export function useRouteUiMetadata(): RouteUiMetadata {
    const matches = useMatches();
    const handles = matches.map((match) => match.handle).filter(isRouteUiHandle);

    return mergeRouteUiMetadata(handles);
}
