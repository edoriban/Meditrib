import { test, expect } from '@playwright/test';
import { SalesPage } from './pages/sales.page';

/**
 * Sales Page UI Tests (Authenticated)
 * These tests require an authenticated session
 */
test.describe('Sales Page UI Elements', () => {
    test('sales page loads correctly', async ({ page }) => {
        const salesPage = new SalesPage(page);
        await salesPage.goto();
        await salesPage.waitForSalesLoad();

        await salesPage.expectToBeOnSalesPage();
    });

    test('new sale button is visible', async ({ page }) => {
        const salesPage = new SalesPage(page);
        await salesPage.goto();
        await salesPage.waitForSalesLoad();

        await expect(salesPage.newSaleButton).toBeVisible();
    });

    test('new sale dialog opens when clicking button', async ({ page }) => {
        const salesPage = new SalesPage(page);
        await salesPage.goto();
        await salesPage.waitForSalesLoad();

        await salesPage.openNewSaleDialog();

        const isDialogOpen = await salesPage.isNewSaleDialogOpen();
        expect(isDialogOpen).toBeTruthy();
    });

    test('sales table is visible', async ({ page }) => {
        const salesPage = new SalesPage(page);
        await salesPage.goto();
        await salesPage.waitForSalesLoad();

        const isTableVisible = await salesPage.isSalesTableVisible();
        expect(isTableVisible).toBeTruthy();
    });

    test('sales page responds correctly', async ({ page }) => {
        const response = await page.goto('/sales');
        expect(response?.status()).toBeLessThan(400);
    });
});
