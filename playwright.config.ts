import { defineConfig, devices } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';
import { loadEnv } from 'vite';

const e2eEnv = loadEnv('e2e', process.cwd(), '');
for (const [key, value] of Object.entries(e2eEnv)) {
    process.env[key] ??= value;
}

const isCI = Boolean(process.env.CI);
const frontendBaseUrl = process.env.E2E_FRONTEND_BASE_URL ?? 'http://localhost:5173';
const apiBaseUrl = process.env.E2E_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

function currentStringEnvironment(): Record<string, string> {
    const environment: Record<string, string> = {};

    for (const [key, value] of Object.entries(process.env)) {
        if (typeof value === 'string') {
            environment[key] = value;
        }
    }

    return environment;
}

// 1. Configure BDD to generate tests from features
const testDir = defineBddConfig({
    paths: ['test/e2e/features/**/*.feature'],
    import: ['test/e2e/steps/**/*.ts'],
    // REMOVED: importTestFrom (unless you have a specific web fixture to extend)
    outputDir: 'test/e2e/.features-gen',
});

export default defineConfig({
    testDir,
    tsconfig: './tsconfig.playwright.json',

    // 2. Start Vite server automatically. The E2E mode loads .env.e2e without shell-specific source/export commands.
    webServer: {
        command: 'pnpm exec vite dev --mode e2e --host 127.0.0.1',
        env: {
            ...currentStringEnvironment(),
            VITE_API_BASE_URL: apiBaseUrl,
        },
        url: frontendBaseUrl,
        reuseExistingServer: !isCI,
        timeout: 120 * 1000,
    },

    fullyParallel: false,
    workers: 1,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,

    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        cucumberReporter('html', { outputFile: 'cucumber-report/index.html' }),
        cucumberReporter('json', { outputFile: 'cucumber-report/report.json' }),
    ],

    outputDir: 'test-results',

    // 3. Configure Projects for Google Chrome (Chromium)
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Optional: Use specific channel if you need installed Google Chrome specifically
                // channel: 'chrome',
            },
        },
        // You can add other browsers here if needed
        // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    ],

    use: {
        baseURL: frontendBaseUrl,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
});
