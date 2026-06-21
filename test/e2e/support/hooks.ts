import { createBdd, test } from 'playwright-bdd';
import { cleanupProjectsForPage } from './projectCleanup';

const { AfterScenario } = createBdd(test);

AfterScenario(async ({ page, request }) => {
    await cleanupProjectsForPage(page, request);
});
