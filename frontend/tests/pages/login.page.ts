import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Login Page Object
 * Handles all login-related interactions
 */
export class LoginPage extends BasePage {
    // Locators
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorMessage: Locator;
    readonly rememberCheckbox: Locator;
    readonly forgotPasswordLink: Locator;
    readonly registerLink: Locator;
    readonly googleLoginButton: Locator;

    constructor(page: Page) {
        super(page);
        // FormInput component renders input with id matching the name prop
        this.emailInput = page.locator('input#email, input[name="email"]');
        this.passwordInput = page.locator('input#password, input[name="password"]');
        this.submitButton = page.locator('button[type="submit"]:has-text("Iniciar sesión")');
        this.errorMessage = page.locator('[role="alert"], .text-destructive');
        this.rememberCheckbox = page.locator('#remember, input[type="checkbox"]');
        this.forgotPasswordLink = page.locator('a[href="/forgot-password"]');
        this.registerLink = page.locator('a[href="/register"]');
        this.googleLoginButton = page.locator('button:has-text("Google")');
    }

    /**
     * Navigate to login page
     */
    async goto(): Promise<void> {
        await this.navigateTo('/login');
        await this.page.waitForLoadState('networkidle');
        // Wait for React to hydrate with longer timeout
        await this.emailInput.waitFor({ state: 'visible', timeout: 20000 });
    }

    /**
     * Fill email field
     */
    async fillEmail(email: string): Promise<void> {
        await this.emailInput.fill(email);
    }

    /**
     * Fill password field
     */
    async fillPassword(password: string): Promise<void> {
        await this.passwordInput.fill(password);
    }

    /**
     * Click submit button
     */
    async clickSubmit(): Promise<void> {
        await this.submitButton.click();
    }

    /**
     * Toggle remember me checkbox
     */
    async toggleRemember(): Promise<void> {
        await this.rememberCheckbox.click();
    }

    /**
     * Complete login flow
     */
    async login(email: string, password: string): Promise<void> {
        await this.fillEmail(email);
        await this.fillPassword(password);
        await this.clickSubmit();
    }

    /**
     * Get error message text if visible
     */
    async getErrorMessage(): Promise<string | null> {
        try {
            await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
            return await this.errorMessage.textContent();
        } catch {
            return null;
        }
    }

    /**
   * Check if login form is visible
   */
    async isLoginFormVisible(): Promise<boolean> {
        try {
            // Wait for form to be loaded
            await this.emailInput.waitFor({ state: 'attached', timeout: 5000 });
            await this.passwordInput.waitFor({ state: 'attached', timeout: 5000 });
            return await this.emailInput.isVisible() && await this.passwordInput.isVisible();
        } catch {
            return false;
        }
    }

    /**
     * Verify we are on login page
     */
    async expectToBeOnLoginPage(): Promise<void> {
        await expect(this.page).toHaveURL(/\/login/);
    }

    /**
     * Navigate to forgot password
     */
    async goToForgotPassword(): Promise<void> {
        await this.forgotPasswordLink.click();
    }

    /**
     * Navigate to registration
     */
    async goToRegister(): Promise<void> {
        await this.registerLink.click();
    }
}
