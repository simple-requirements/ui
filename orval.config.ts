import { defineConfig } from 'orval';

const openApiDocument = './openapi/backend-api.json';

export default defineConfig({
    backendApi: {
        input: { target: openApiDocument },

        output: {
            client: 'react-query',
            httpClient: 'fetch',
            mode: 'tags-split',

            target: './src/api/generated/endpoints',
            schemas: './src/api/generated/models',

            clean: true,
            urlEncodeParameters: true,

            override: {
                query: { useQuery: true, useMutation: true, usePrefetch: true },

                fetch: { includeHttpResponseReturnType: false },
            },
        },
    },

    backendApiZod: {
        input: { target: openApiDocument },

        output: {
            client: 'zod',
            mode: 'tags-split',

            target: './src/api/generated/zod',
            fileExtension: '.zod.ts',

            clean: true,
        },
    },
});
