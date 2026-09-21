import type { ReactNode } from 'react';

import { InlineStatus } from '@/components/Feedback/InlineStatus';

export type LoadableContentProps = Readonly<{
    loading: boolean;
    error: boolean;
    empty?: boolean;
    loadingMessage: string;
    errorMessage: string;
    emptyMessage?: string;
    children: ReactNode;
}>;

export function LoadableContent({
    loading,
    error,
    empty = false,
    loadingMessage,
    errorMessage,
    emptyMessage,
    children,
}: LoadableContentProps) {
    if (loading) {
        return <InlineStatus kind='loading'>{loadingMessage}</InlineStatus>;
    }

    if (error) {
        return <InlineStatus kind='error'>{errorMessage}</InlineStatus>;
    }

    if (empty) {
        return <InlineStatus kind='empty'>{emptyMessage ?? 'No data available.'}</InlineStatus>;
    }

    return children;
}
