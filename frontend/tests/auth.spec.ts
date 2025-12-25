import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';

/**
 * Authenticated user tests
 * These tests run with an authenticated session
 */
test.describe('Authenticated User Flow', () => {
    let loginPage: LoginPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
    });

    test('authenticated user can access dashboard', async ({ page }) => {
        await page.goto('/dashboard');

        // Should stay on dashboard, not redirect to login
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('authenticated user can access products page', async ({ page }) => {
        await page.goto('/products');

        // Should stay on products page
        await expect(page).toHaveURL(/\/products/);
    });

    test('authenticated user can access sales page', async ({ page }) => {
        await page.goto('/sales');

        // Should stay on sales page
        await expect(page).toHaveURL(/\/sales/);
    });
});
