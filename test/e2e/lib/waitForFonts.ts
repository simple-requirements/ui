import { type Page } from '@playwright/test';

export const waitForFonts = async (page: Page) => {
    await page.evaluate(() => document.fonts.ready);
};
