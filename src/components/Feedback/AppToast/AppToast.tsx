import { Toast } from 'primereact/toast';
import { useEffect, useRef } from 'react';

import { subscribeToToastMessages } from '@/stores/toastStore';

import '@/components/Feedback/AppToast/AppToast.scss';

export function AppToast() {
    const toastRef = useRef<Toast>(null);

    useEffect(
        () =>
            subscribeToToastMessages((message) => {
                toastRef.current?.show(message);
            }),
        [],
    );

    return (
        <Toast
            ref={toastRef}
            pt={{ root: { className: 'app-toast' } }}
        />
    );
}
