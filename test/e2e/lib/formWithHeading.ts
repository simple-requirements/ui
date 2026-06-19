import { type Page } from '@playwright/test';

export const formWithHeading = (page: Page, heading: string) =>
    page.locator('form').filter({ has: page.getByRole('heading', { name: heading }) });
