import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Inventory/Products Page Object
 * Handles product management interactions
 */
export class InventoryPage extends BasePage {
    // Locators
    readonly pageTitle: Locator;
    readonly productsTable: Locator;
    readonly productsTableRows: Locator;
    readonly searchInput: Locator;
    readonly totalProductsText: Locator;
    readonly exportButton: Locator;
    readonly importButton: Locator;
    readonly createTagButton: Locator;
    readonly loadingIndicator: Locator;
    readonly errorMessage: Locator;
    readonly stockFilterDropdown: Locator;
    readonly productDashboard: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.locator('h1:has-text("Inventario de Medicamentos")');
        this.productsTable = page.locator('table, [role="table"]');
        this.productsTableRows = page.locator('table tbody tr, [role="row"]');
        this.searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]');
        this.totalProductsText = page.locator('text=/\\d+ medicamentos/');
        this.exportButton = page.locator('button:has-text("Exportar")');
        this.importButton = page.locator('button:has-text("Importar")');
        this.createTagButton = page.locator('button:has-text("Etiqueta"), button:has-text("Tag")');
        this.loadingIndicator = page.locator('text=Cargando');
        this.errorMessage = page.locator('text=Error');
        this.stockFilterDropdown = page.locator('[data-stock-filter], select');
        this.productDashboard = page.locator('[class*="dashboard"], [class*="stats"]');
    }

    /**
     * Navigate to inventory page
     */
    async goto(): Promise<void> {
        await this.navigateTo('/products');
        await this.waitForPageLoad();
    }

    /**
     * Wait for products to load
     */
    async waitForProductsLoad(): Promise<void> {
        try {
            await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 15000 });
        } catch {
            // Loading indicator might not exist
        }
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Check if page has loaded successfully
     */
    async isLoaded(): Promise<boolean> {
        const titleVisible = await this.pageTitle.isVisible();
        return titleVisible;
    }

    /**
     * Get total products count from UI
     */
    async getTotalProducts(): Promise<number | null> {
        await this.waitForProductsLoad();
        try {
            const text = await this.totalProductsText.textContent();
            if (text) {
                const match = text.match(/(\d+)/);
                return match ? parseInt(match[1], 10) : null;
            }
            return null;
        } catch {
            return null;
        }
    }

    /**
     * Get number of visible rows in table
     */
    async getVisibleProductsCount(): Promise<number> {
        await this.waitForProductsLoad();
        return await this.productsTableRows.count();
    }

    /**
     * Search for a product
     */
    async searchProduct(term: string): Promise<void> {
        await this.searchInput.fill(term);
        // Wait for search debounce and API response
        await this.page.waitForTimeout(600);
        await this.waitForProductsLoad();
    }

    /**
     * Clear search
     */
    async clearSearch(): Promise<void> {
        await this.searchInput.clear();
        await this.waitForProductsLoad();
    }

    /**
     * Click export button
     */
    async clickExport(): Promise<void> {
        await this.exportButton.click();
    }

    /**
     * Click import button
     */
    async clickImport(): Promise<void> {
        await this.importButton.click();
    }

    /**
     * Verify we are on inventory page
     */
    async expectToBeOnInventoryPage(): Promise<void> {
        await expect(this.page).toHaveURL(/\/products/);
        await expect(this.pageTitle).toBeVisible();
    }

    /**
     * Check if products table is visible
     */
    async isProductsTableVisible(): Promise<boolean> {
        return await this.productsTable.isVisible();
    }

    /**
     * Check if product dashboard stats are visible
     */
    async isDashboardVisible(): Promise<boolean> {
        return await this.productDashboard.isVisible();
    }
}
