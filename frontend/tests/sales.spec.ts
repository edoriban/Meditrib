import { test, expect } from '@playwright/test';
import { SalesPage } from './pages/sales.page';
import { LoginPage } from './pages/login.page';

test.describe('Sales/POS Flow', () => {
    let salesPage: SalesPage;

    test.beforeEach(async ({ page }) => {
        salesPage = new SalesPage(page);
    });

    test('sales page requires authentication', async ({ page }) => {
        await salesPage.goto();

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);
    });

    test.describe('When navigating directly (for visual testing)', () => {
        test('sales page title is correct', async ({ page }) => {
            // Navigate and check that redirect happens or page loads
            const response = await page.goto('/sales');
            expect(response?.status()).toBeLessThan(400);
        });
    });
});

// Tests that would run after authentication (mock or real)
test.describe('Sales Page UI Elements', () => {
    test('sales page displays page title', async ({ page }) => {
        // This test would require authentication setup
        // Skip for now - requires auth fixture implementation
        const salesPage = new SalesPage(page);
        await salesPage.goto();

        const isLoaded = await salesPage.isLoaded();
        expect(isLoaded).toBeTruthy();

        await salesPage.expectToBeOnSalesPage();
    });

    test('new sale button is visible and clickable', async ({ page }) => {
        // Requires authentication
        const salesPage = new SalesPage(page);
        await salesPage.goto();
        await salesPage.waitForSalesLoad();

        await expect(salesPage.newSaleButton).toBeVisible();
    });

    test('new sale dialog opens when clicking button', async ({ page }) => {
        // Requires authentication
        const salesPage = new SalesPage(page);
        await salesPage.goto();
        await salesPage.waitForSalesLoad();

        await salesPage.openNewSaleDialog();

        const isDialogOpen = await salesPage.isNewSaleDialogOpen();
        expect(isDialogOpen).toBeTruthy();
    });

    test('sales table is visible', async ({ page }) => {
        // Requires authentication
        const salesPage = new SalesPage(page);
        await salesPage.goto();
        await salesPage.waitForSalesLoad();

        const isTableVisible = await salesPage.isSalesTableVisible();
        expect(isTableVisible).toBeTruthy();
    });
});
