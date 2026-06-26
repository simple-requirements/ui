import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ConfirmDialogProvider } from '@/shared/dialogs/ConfirmDialogProvider';
import { ToastProvider } from '@/shared/feedback/ToastProvider';
import '@/index.scss';

const root = document.getElementById('root');
const queryClient = new QueryClient();
if (root) {
    createRoot(root).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <ToastProvider>
                        <ConfirmDialogProvider>
                            <App />
                        </ConfirmDialogProvider>
                    </ToastProvider>
                </ErrorBoundary>
            </QueryClientProvider>
        </StrictMode>,
    );
}
