/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    test: {
        include: ['test/**/*.spec.ts'],
        environment: 'jsdom',
        globals: true,
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['test/**/*.spec.{ts,tsx}', 'src/main.tsx', 'src/**/*.d.ts'],
        },
    },
});
