import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Inventory/Products Page Object
 * Handles product management interactions
 */
export class InventoryPage extends BasePage {
    // Locators - Updated to match actual UI
    readonly pageTitle: Locator;
    readonly sectionTitle: Locator;
    readonly productsTable: Locator;
    readonly productsTableRows: Locator;
    readonly searchInput: Locator;
    readonly totalProductsText: Locator;
    readonly exportButton: Locator;
    readonly importButton: Locator;
    readonly filterButton: Locator;
    readonly loadingIndicator: Locator;
    readonly createProductButton: Locator;
    readonly paginationInfo: Locator;

    constructor(page: Page) {
        super(page);
        // Main page title
        this.pageTitle = page.locator('h1:has-text("Inventario de Productos")');
        // Section title within the table component
        this.sectionTitle = page.locator('h2:has-text("Productos")');
        // Table selectors
        this.productsTable = page.locator('table');
        this.productsTableRows = page.locator('table tbody tr');
        // Search input with placeholder "Buscar productos..."
        this.searchInput = page.locator('input[placeholder="Buscar productos..."]');
        // Total products text pattern (e.g., "50 productos en total")
        this.totalProductsText = page.locator('span:has-text("productos en total")');
        // Action buttons
        this.exportButton = page.locator('button:has-text("Exportar")');
        this.importButton = page.locator('button:has-text("Importar Excel")');
        this.filterButton = page.locator('button:has-text("Filtros")');
        this.createProductButton = page.locator('button:has-text("Agregar"), button:has-text("Nuevo")');
        // Loading and pagination
        this.loadingIndicator = page.locator('.animate-pulse, text=Cargando');
        this.paginationInfo = page.locator('text=/Página \\d+ de \\d+/');
    }

    /**
     * Navigate to inventory page
     */
    async goto(): Promise<void> {
        await this.navigateTo('/products');
        await this.page.waitForLoadState('networkidle');
        // Wait for the main title to be visible with longer timeout
        await this.pageTitle.waitFor({ state: 'visible', timeout: 20000 });
    }

    /**
     * Wait for products to load
     */
    async waitForProductsLoad(): Promise<void> {
        // Wait for network to be idle (API calls complete)
        await this.page.waitForLoadState('networkidle');
        // Wait for loading indicators to disappear
        try {
            await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
        } catch {
            // Loading indicator might not exist or already hidden
        }
    }

    /**
     * Check if page has loaded successfully
     */
    async isLoaded(): Promise<boolean> {
        try {
            await this.pageTitle.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
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
        await this.searchInput.waitFor({ state: 'visible', timeout: 5000 });
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
        try {
            await this.productsTable.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if export button is visible
     */
    async isExportButtonVisible(): Promise<boolean> {
        return await this.exportButton.isVisible();
    }

    /**
     * Check if import button is visible
     */
    async isImportButtonVisible(): Promise<boolean> {
        return await this.importButton.isVisible();
    }
}
