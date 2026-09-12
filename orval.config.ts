import { defineConfig } from 'orval';
import process from 'node:process';

const openApiTarget = process.env.OPENAPI_TARGET ?? 'http://localhost:3000/api/docs-json';

export default defineConfig({
    requirementsApi: {
        input: { target: openApiTarget },
        output: {
            mode: 'tags-split',
            target: './src/api/generated/requirements-api.ts',
            schemas: './src/api/generated/model',
            client: 'react-query',
            httpClient: 'fetch',
            clean: true,
            formatter: 'prettier',
            override: {
                mutator: { path: './src/api/fetch.ts', name: 'apiFetch' },
                query: { useQuery: true, options: { staleTime: 30_000 } },
            },
        },
    },

    requirementsApiZod: {
        input: { target: openApiTarget },
        output: {
            mode: 'single',
            target: './src/api/generated/zod/requirements-api.zod.ts',
            client: 'zod',
            clean: true,
            override: { zod: { version: 4 } },
        },
    },
});
