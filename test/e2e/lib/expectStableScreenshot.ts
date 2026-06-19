import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { waitForFonts } from './waitForFonts';

export const expectStableScreenshot = async (
    page: Page,
    target: Locator,
    name: string,
    options: { maxDiffPixelRatio: number; threshold: number },
) => {
    options.maxDiffPixelRatio ? options.maxDiffPixelRatio : 0.01;
    options.threshold ? options.threshold : 0.2;

    await expect(target).toBeVisible();
    await waitForFonts(page);
    await expect(target).toHaveScreenshot(name, {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: options.maxDiffPixelRatio,
        threshold: options.threshold,
    });
};
