/// <reference types="vitest/config" />

import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],

    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },

    optimizeDeps: { entries: ['index.html'] },

    test: {
        include: ['test/**/*.spec.{ts,tsx}'],
        environment: 'jsdom',
        globals: true,
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['test/**/*.spec.{ts,tsx}', 'src/main.tsx', 'src/**/*.d.ts'],
        },
    },
    server: { host: '127.0.0.1', port: 5173 },
});
