import { test, expect } from '@playwright/test';
import { InventoryPage } from './pages/inventory.page';

/**
 * Inventory Page UI Tests (Authenticated)
 * These tests require an authenticated session
 */
test.describe('Inventory Page UI Elements', () => {
    test('inventory page displays title', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();

        const isLoaded = await inventoryPage.isLoaded();
        expect(isLoaded).toBeTruthy();

        await inventoryPage.expectToBeOnInventoryPage();
    });

    test('products table is visible', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await inventoryPage.waitForProductsLoad();

        const isTableVisible = await inventoryPage.isProductsTableVisible();
        expect(isTableVisible).toBeTruthy();
    });

    test('total products count is displayed', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await inventoryPage.waitForProductsLoad();

        const total = await inventoryPage.getTotalProducts();
        expect(total).not.toBeNull();
        expect(total).toBeGreaterThanOrEqual(0);
    });

    test('search input is visible', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await inventoryPage.waitForProductsLoad();

        await expect(inventoryPage.searchInput).toBeVisible();
    });

    test('export button is visible', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await inventoryPage.waitForProductsLoad();

        const isVisible = await inventoryPage.isExportButtonVisible();
        expect(isVisible).toBeTruthy();
    });

    test('import button is visible', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await inventoryPage.waitForProductsLoad();

        const isVisible = await inventoryPage.isImportButtonVisible();
        expect(isVisible).toBeTruthy();
    });

    test('products route responds correctly', async ({ page }) => {
        const response = await page.goto('/products');
        expect(response?.status()).toBeLessThan(400);
    });
});
