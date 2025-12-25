import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import * as fs from 'fs';

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

    // Get the token from localStorage to include in storage state
    const token = await page.evaluate(() => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    });

    // Save storage state with the token as an origin item
    // This includes both cookies and localStorage
    const storageState = await page.context().storageState();

    // Add localStorage to the origins
    storageState.origins = [{
        origin: 'http://localhost:5173',
        localStorage: [
            { name: 'token', value: token || '' }
        ]
    }];

    // Write the modified storage state
    fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2));
});
