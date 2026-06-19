import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export const expectVisibleAndEnabled = async (control: Locator) => {
    await expect(control).toBeVisible();
    await expect(control).toBeEnabled();
};
