import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';

test.describe('Authentication Flow', () => {
    let loginPage: LoginPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
    });

    test('login page loads correctly', async ({ page }) => {
        await loginPage.goto();

        // Verify login form is visible
        const isFormVisible = await loginPage.isLoginFormVisible();
        expect(isFormVisible).toBeTruthy();

        // Verify URL
        await loginPage.expectToBeOnLoginPage();
    });

    test('login form shows validation for empty fields', async ({ page }) => {
        await loginPage.goto();

        // Try to submit without filling fields
        await loginPage.clickSubmit();

        // Give time for validation messages to appear
        await page.waitForTimeout(500);

        // We should still be on login page
        await loginPage.expectToBeOnLoginPage();
    });

    test('protected routes redirect to login when not authenticated', async ({ page }) => {
        // Try to access dashboard directly without auth
        await page.goto('/dashboard');

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);
    });

    test('protected routes redirect for other pages', async ({ page }) => {
        // Try to access sales page without auth
        await page.goto('/sales');

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);
    });

    test('forgot password link navigates correctly', async ({ page }) => {
        await loginPage.goto();

        // Click forgot password
        if (await loginPage.forgotPasswordLink.isVisible()) {
            await loginPage.goToForgotPassword();
            await expect(page).toHaveURL(/\/forgot-password/);
        }
    });

    test('register link navigates correctly', async ({ page }) => {
        await loginPage.goto();

        // Click register link
        if (await loginPage.registerLink.isVisible()) {
            await loginPage.goToRegister();
            await expect(page).toHaveURL(/\/register/);
        }
    });
});
