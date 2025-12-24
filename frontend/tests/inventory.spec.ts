import { test, expect } from '@playwright/test';
import { InventoryPage } from './pages/inventory.page';

test.describe('Inventory Management Flow', () => {
    let inventoryPage: InventoryPage;

    test.beforeEach(async ({ page }) => {
        inventoryPage = new InventoryPage(page);
    });

    test('inventory page requires authentication', async ({ page }) => {
        await inventoryPage.goto();

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);
    });

    test.describe('Direct navigation check', () => {
        test('products route responds correctly', async ({ page }) => {
            const response = await page.goto('/products');
            expect(response?.status()).toBeLessThan(400);
        });
    });
});

// Tests that would run after authentication
test.describe('Inventory Page UI Elements', () => {
    test('inventory page displays title', async ({ page }) => {
        // Requires authentication
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();

        const isLoaded = await inventoryPage.isLoaded();
        expect(isLoaded).toBeTruthy();

        await inventoryPage.expectToBeOnInventoryPage();
    });

    test('products table is visible', async ({ page }) => {
        // Requires authentication
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await inventoryPage.waitForProductsLoad();

        const isTableVisible = await inventoryPage.isProductsTableVisible();
        expect(isTableVisible).toBeTruthy();
    });

    test('total products count is displayed', async ({ page }) => {
        // Requires authentication
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await inventoryPage.waitForProductsLoad();

        const total = await inventoryPage.getTotalProducts();
        expect(total).not.toBeNull();
        expect(total).toBeGreaterThanOrEqual(0);
    });

    test('search filters products', async ({ page }) => {
        // Requires authentication
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await inventoryPage.waitForProductsLoad();

        const initialCount = await inventoryPage.getVisibleProductsCount();

        // Search for something specific
        await inventoryPage.searchProduct('paracetamol');

        // Results should change (either fewer or same if no match)
        const filteredCount = await inventoryPage.getVisibleProductsCount();
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('export button is visible', async ({ page }) => {
        // Requires authentication
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await inventoryPage.waitForProductsLoad();

        await expect(inventoryPage.exportButton).toBeVisible();
    });

    test('import button is visible', async ({ page }) => {
        // Requires authentication
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await inventoryPage.waitForProductsLoad();

        await expect(inventoryPage.importButton).toBeVisible();
    });
});
