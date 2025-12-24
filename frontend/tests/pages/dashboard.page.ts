import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Dashboard Page Object
 * Handles dashboard interactions and navigation
 */
export class DashboardPage extends BasePage {
    // Locators
    readonly pageTitle: Locator;
    readonly sidebar: Locator;
    readonly sectionCards: Locator;
    readonly chartArea: Locator;
    readonly loadingIndicator: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.locator('h1, h2').first();
        this.sidebar = page.locator('[data-sidebar], aside, nav');
        this.sectionCards = page.locator('[class*="card"], .section-card');
        this.chartArea = page.locator('[class*="chart"], canvas, svg');
        this.loadingIndicator = page.locator('text=Cargando');
    }

    /**
     * Navigate to dashboard
     */
    async goto(): Promise<void> {
        await this.navigateTo('/dashboard');
        await this.waitForPageLoad();
    }

    /**
     * Check if dashboard has loaded
     */
    async isLoaded(): Promise<boolean> {
        try {
            // Wait for loading to finish
            await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
            return true;
        } catch {
            // If no loading indicator, check for content
            const hasCards = await this.sectionCards.count() > 0;
            return hasCards;
        }
    }

    /**
     * Wait for dashboard to be fully loaded
     */
    async waitForDashboardLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        // Wait for React to hydrate
        await this.page.waitForTimeout(500);
    }

    /**
     * Get number of section cards
     */
    async getSectionCardsCount(): Promise<number> {
        return await this.sectionCards.count();
    }

    /**
     * Navigate to a specific route via URL
     */
    async navigateToRoute(route: string): Promise<void> {
        await this.navigateTo(route);
    }

    /**
     * Click on sidebar link by text
     */
    async clickSidebarLink(linkText: string): Promise<void> {
        await this.sidebar.locator(`text=${linkText}`).click();
    }

    /**
     * Verify we are on dashboard
     */
    async expectToBeOnDashboard(): Promise<void> {
        await expect(this.page).toHaveURL(/\/dashboard/);
    }

    /**
     * Get page title text
     */
    async getPageTitle(): Promise<string | null> {
        return await this.pageTitle.textContent();
    }
}
