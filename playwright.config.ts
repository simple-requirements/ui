import { defineConfig, devices } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';

const isCI = Boolean(process.env.CI);

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

    // 2. Start Vite server automatically
    webServer: {
        command: 'pnpm run dev', // Or 'vite'
        url: 'http://localhost:5173', // Default Vite port
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
        baseURL: 'http://localhost:5173', // Base URL for all tests
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
});
