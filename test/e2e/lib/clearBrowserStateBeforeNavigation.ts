import type { Page } from '@playwright/test';

export const clearBrowserStateBeforeNavigation = async (page: Page) => {
    await page.addInitScript(() => {
        sessionStorage.clear();
        localStorage.clear();
    });
};
