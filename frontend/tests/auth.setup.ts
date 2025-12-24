import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // We use the credentials provided by the user
    const email = 'admin@vanpos.mx';
    const password = 'admin123';

    await loginPage.goto();
    await loginPage.login(email, password);

    // Wait for navigation to dashboard or home
    await page.waitForURL(url => !url.href.includes('/login'));

    // Verify we are not on login page anymore
    await expect(page).not.toHaveURL(/\/login/);

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
});
