import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

/**
 * Multi-Tenancy Data Isolation Tests
 * 
 * These tests verify that data created by one tenant is NOT visible to another tenant.
 * This is critical for SaaS security.
 */
test.describe('Multi-Tenancy Data Isolation', () => {
    // Tenant A credentials (VanPOS Demo)
    const tenantA = {
        email: 'admin@vanpos.mx',
        password: 'admin123',
        name: 'VanPOS Demo'
    };

    // Tenant B credentials (Farmacia Test)
    const tenantB = {
        email: 'test@farmacia.mx',
        password: 'test123',
        name: 'Farmacia Test'
    };

    test.describe.configure({ mode: 'serial' }); // Run tests in order

    let productNameCreatedByTenantA: string;
    let createdProductId: number;

    test('setup: clear any existing auth state', async ({ context }) => {
        // Clear storage to ensure fresh login
        await context.clearCookies();
    });

    test('Tenant A can create a product', async ({ page }) => {
        const loginPage = new LoginPage(page);

        // Login as Tenant A
        await loginPage.goto();
        await loginPage.login(tenantA.email, tenantA.password);
        await page.waitForURL(url => !url.href.includes('/login'));

        // Navigate to products to ensure we're authenticated
        await page.goto('/products');
        await page.waitForLoadState('networkidle');

        // Wait for the page to load
        await page.locator('h1:has-text("Inventario de Productos")').waitFor({ state: 'visible', timeout: 15000 });

        // Generate unique product name for this test run
        productNameCreatedByTenantA = `Test-Product-TenantA-${Date.now()}`;

        // Create product via browser fetch (uses token from localStorage)
        const createResult = await page.evaluate(async (productName) => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('/api/v1/products/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: productName,
                    description: 'Product created by Tenant A for isolation test',
                    purchase_price: 10.0,
                    sale_price: 15.0,
                })
            });
            return { ok: response.ok, status: response.status, data: await response.json() };
        }, productNameCreatedByTenantA);

        console.log('[DEBUG] Create product result:', JSON.stringify(createResult, null, 2));

        expect(createResult.ok).toBeTruthy();
        expect(createResult.data.name).toBe(productNameCreatedByTenantA);
        createdProductId = createResult.data.id;

        // Verify product exists for Tenant A
        const verifyResult = await page.evaluate(async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('/api/v1/products/paginated?page=1&page_size=100', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        });

        const productExists = verifyResult.items.some((p: any) => p.name === productNameCreatedByTenantA);
        expect(productExists).toBeTruthy();

        console.log(`[Tenant A] Created product: ${productNameCreatedByTenantA} (ID: ${createdProductId})`);
    });

    test('Tenant B cannot see product created by Tenant A', async ({ page }) => {
        const loginPage = new LoginPage(page);

        // Login as Tenant B
        await loginPage.goto();
        await loginPage.login(tenantB.email, tenantB.password);
        await page.waitForURL(url => !url.href.includes('/login'));

        // Navigate to products
        await page.goto('/products');
        await page.waitForLoadState('networkidle');

        // Wait for the page to load
        await page.locator('h1:has-text("Inventario de Productos")').waitFor({ state: 'visible', timeout: 15000 });

        // Check products via browser fetch
        const data = await page.evaluate(async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('/api/v1/products/paginated?page=1&page_size=100', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        });

        const productFound = data.items.some((p: any) => p.name === productNameCreatedByTenantA);

        // CRITICAL ASSERTION: Tenant B should NOT see Tenant A's product
        expect(productFound).toBeFalsy();

        console.log(`[Tenant B] Verified product "${productNameCreatedByTenantA}" is NOT visible (total products for Tenant B: ${data.total})`);
    });

    test('Tenant A still sees their own product after Tenant B login', async ({ page }) => {
        const loginPage = new LoginPage(page);

        // Login as Tenant A again
        await loginPage.goto();
        await loginPage.login(tenantA.email, tenantA.password);
        await page.waitForURL(url => !url.href.includes('/login'));

        // Navigate to products
        await page.goto('/products');
        await page.waitForLoadState('networkidle');

        // Check products via browser fetch
        const data = await page.evaluate(async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('/api/v1/products/paginated?page=1&page_size=100', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        });

        const productFound = data.items.some((p: any) => p.name === productNameCreatedByTenantA);

        // Tenant A should still see their product
        expect(productFound).toBeTruthy();

        console.log(`[Tenant A] Verified product "${productNameCreatedByTenantA}" is still visible`);
    });

    test('cleanup: delete test product', async ({ page }) => {
        const loginPage = new LoginPage(page);

        // Login as Tenant A to clean up
        await loginPage.goto();
        await loginPage.login(tenantA.email, tenantA.password);
        await page.waitForURL(url => !url.href.includes('/login'));

        // Navigate to a page first to ensure cookies are set
        await page.goto('/products');
        await page.waitForLoadState('networkidle');

        // Delete the test product
        if (createdProductId) {
            const deleteResult = await page.evaluate(async (productId) => {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`/api/v1/products/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return { ok: response.ok, status: response.status };
            }, createdProductId);

            expect(deleteResult.ok).toBeTruthy();
            console.log(`[Cleanup] Deleted test product: ${productNameCreatedByTenantA}`);
        }
    });
});

test.describe('API-Level Multi-Tenancy Verification', () => {
    test('API returns 401 for unauthenticated requests', async ({ request }) => {
        const response = await request.get('http://localhost:8000/api/v1/products/');
        expect(response.status()).toBe(401);
    });

    test('API endpoints require authentication', async ({ request }) => {
        const endpoints = [
            'http://localhost:8000/api/v1/products/',
            'http://localhost:8000/api/v1/sales/',
            'http://localhost:8000/api/v1/clients/',
        ];

        for (const endpoint of endpoints) {
            const response = await request.get(endpoint);
            expect(response.status()).toBe(401);
        }
    });
});
