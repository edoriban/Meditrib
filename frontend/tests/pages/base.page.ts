import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object class with common utilities
 */
export abstract class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigate to a specific path
     */
    async navigateTo(path: string): Promise<void> {
        await this.page.goto(path);
    }

    /**
     * Wait for the page to be fully loaded (network idle)
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Wait for a specific element to be visible
     */
    async waitForElement(selector: string): Promise<Locator> {
        const element = this.page.locator(selector);
        await element.waitFor({ state: 'visible' });
        return element;
    }

    /**
     * Get current URL path
     */
    getCurrentPath(): string {
        return new URL(this.page.url()).pathname;
    }

    /**
     * Check if element exists on page
     */
    async elementExists(selector: string): Promise<boolean> {
        const count = await this.page.locator(selector).count();
        return count > 0;
    }

    /**
     * Take a screenshot with a descriptive name
     */
    async takeScreenshot(name: string): Promise<void> {
        await this.page.screenshot({ path: `test-results/${name}.png` });
    }
}
