import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Sales Page Object
 * Handles POS and sales-related interactions
 */
export class SalesPage extends BasePage {
    // Locators
    readonly pageTitle: Locator;
    readonly newSaleButton: Locator;
    readonly salesTable: Locator;
    readonly salesTableRows: Locator;
    readonly searchInput: Locator;
    readonly createSaleDialog: Locator;
    readonly loadingIndicator: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.locator('h1:has-text("Ventas")');
        this.newSaleButton = page.locator('button:has-text("Nueva Venta")');
        this.salesTable = page.locator('table, [role="table"]');
        this.salesTableRows = page.locator('table tbody tr, [role="row"]');
        this.searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]');
        this.createSaleDialog = page.locator('[role="dialog"]');
        this.loadingIndicator = page.locator('text=Cargando ventas');
        this.errorMessage = page.locator('text=Error al cargar ventas');
    }

    /**
     * Navigate to sales page
     */
    async goto(): Promise<void> {
        await this.navigateTo('/sales');
        await this.waitForPageLoad();
    }

    /**
     * Wait for sales data to load
     */
    async waitForSalesLoad(): Promise<void> {
        // Wait for loading to finish or table to appear
        try {
            await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
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
        const hasError = await this.errorMessage.isVisible().catch(() => false);
        return titleVisible && !hasError;
    }

    /**
     * Open new sale dialog
     */
    async openNewSaleDialog(): Promise<void> {
        await this.newSaleButton.click();
        await this.createSaleDialog.waitFor({ state: 'visible' });
    }

    /**
     * Check if new sale dialog is open
     */
    async isNewSaleDialogOpen(): Promise<boolean> {
        return await this.createSaleDialog.isVisible();
    }

    /**
     * Close new sale dialog
     */
    async closeNewSaleDialog(): Promise<void> {
        // Press Escape or click outside
        await this.page.keyboard.press('Escape');
    }

    /**
     * Get number of sales in table
     */
    async getSalesCount(): Promise<number> {
        await this.waitForSalesLoad();
        return await this.salesTableRows.count();
    }

    /**
     * Search for a sale
     */
    async searchSale(term: string): Promise<void> {
        if (await this.searchInput.isVisible()) {
            await this.searchInput.fill(term);
            // Wait for search results
            await this.page.waitForTimeout(500);
        }
    }

    /**
     * Verify we are on sales page
     */
    async expectToBeOnSalesPage(): Promise<void> {
        await expect(this.page).toHaveURL(/\/sales/);
        await expect(this.pageTitle).toBeVisible();
    }

    /**
     * Check if sales table is visible
     */
    async isSalesTableVisible(): Promise<boolean> {
        return await this.salesTable.isVisible();
    }
}
