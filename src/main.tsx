import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/index.scss';

const root = document.getElementById('root');
const queryClient = new QueryClient();
if (root) {
    createRoot(root).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <App />
                </ErrorBoundary>
            </QueryClientProvider>
        </StrictMode>,
    );
}
