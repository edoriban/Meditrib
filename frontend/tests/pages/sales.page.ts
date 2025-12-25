import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Sales Page Object
 * Handles POS and sales-related interactions
 */
export class SalesPage extends BasePage {
    // Locators - Updated to match actual UI
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
        // Title "Ventas" (not "Historial de Ventas")
        this.pageTitle = page.locator('h1:has-text("Ventas")');
        // Button with Plus icon and "Nueva Venta" text
        this.newSaleButton = page.locator('button:has-text("Nueva Venta")');
        // Table
        this.salesTable = page.locator('table');
        this.salesTableRows = page.locator('table tbody tr');
        // Search input (inside SalesTable component)
        this.searchInput = page.locator('input[placeholder*="Buscar"]');
        // Dialog
        this.createSaleDialog = page.locator('[role="dialog"]');
        // Loading and error states
        this.loadingIndicator = page.locator('text=Cargando ventas');
        this.errorMessage = page.locator('text=Error al cargar ventas');
    }

    /**
     * Navigate to sales page
     */
    async goto(): Promise<void> {
        await this.navigateTo('/sales');
        await this.waitForPageLoad();
        // Wait for title or loading to finish
        await Promise.race([
            this.pageTitle.waitFor({ state: 'visible', timeout: 10000 }),
            this.loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 }),
        ]);
    }

    /**
     * Wait for sales data to load
     */
    async waitForSalesLoad(): Promise<void> {
        // Wait for loading to finish
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
        try {
            // Either title is visible or loading finished
            const hasError = await this.errorMessage.isVisible().catch(() => false);
            if (hasError) return false;

            await this.pageTitle.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Open new sale dialog
     */
    async openNewSaleDialog(): Promise<void> {
        await this.newSaleButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.newSaleButton.click();
        await this.createSaleDialog.waitFor({ state: 'visible', timeout: 5000 });
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
        await this.page.keyboard.press('Escape');
        await this.createSaleDialog.waitFor({ state: 'hidden', timeout: 3000 });
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
        try {
            await this.salesTable.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if new sale button is visible and enabled
     */
    async isNewSaleButtonVisible(): Promise<boolean> {
        return await this.newSaleButton.isVisible();
    }
}
