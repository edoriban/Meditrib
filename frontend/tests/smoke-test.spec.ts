import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
    test('main page loads correctly', async ({ page }) => {
        const response = await page.goto('http://localhost:5173/');

        // Verify we got a successful response
        expect(response?.status()).toBeLessThan(400);

        // Verify URL is correct
        await expect(page).toHaveURL(/localhost:5173/);

        // Wait for the app to be interactive (React hydration)
        await page.waitForLoadState('domcontentloaded');

        // Verify the root div exists (React mount point)
        await expect(page.locator('#root')).toBeAttached();
    });

    test('page has no console errors on load', async ({ page }) => {
        const consoleErrors: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('http://localhost:5173/');
        await page.waitForLoadState('domcontentloaded');

        // Allow for common development warnings, but no critical errors
        const criticalErrors = consoleErrors.filter(
            (error) =>
                !error.includes('DevTools') &&
                !error.includes('Warning:') &&
                !error.includes('favicon')
        );

        expect(criticalErrors).toHaveLength(0);
    });
});
