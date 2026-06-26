import { createBdd, test } from 'playwright-bdd';
import { resetBackendDatabase } from './projectCleanup';

const { BeforeScenario } = createBdd(test);

BeforeScenario(async ({ request }) => {
    await resetBackendDatabase(request);
});
