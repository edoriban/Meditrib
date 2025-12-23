import { useCallback } from 'react';

// Route module map for prefetching
const routeModules: Record<string, () => Promise<unknown>> = {
    '/dashboard': () => import('@/pages/DashboardPage'),
    '/products': () => import('@/pages/inventory/ProductsPage'),
    '/sales': () => import('@/pages/sales/SalesPage'),
    '/clients': () => import('@/pages/clients/ClientsPage'),
    '/suppliers': () => import('@/pages/suppliers/SuppliersPage'),
    '/purchase-orders': () => import('@/pages/purchase_orders/PurchaseOrderPage'),
    '/reports': () => import('@/pages/reports/ReportsPage'),
    '/invoices': () => import('@/pages/invoices/InvoicesPage'),
    '/expenses': () => import('@/pages/expenses/ExpensesPage'),
    '/batches': () => import('@/pages/batches/BatchesPage'),
    '/alerts': () => import('@/pages/alerts/AlertsPage'),
    '/users': () => import('@/pages/users/UsersPage'),
    '/roles': () => import('@/pages/roles/RolesPage'),
    '/settings': () => import('@/pages/settings/SettingsPage'),
};

// Track already prefetched routes to avoid duplicate fetches
const prefetchedRoutes = new Set<string>();

/**
 * Hook to prefetch route modules on hover/focus
 * Improves perceived navigation performance by loading chunks ahead of time
 */
export function usePrefetch() {
    const prefetch = useCallback((route: string) => {
        // Skip if already prefetched
        if (prefetchedRoutes.has(route)) return;

        const moduleLoader = routeModules[route];
        if (moduleLoader) {
            prefetchedRoutes.add(route);
            // Prefetch during idle time if available, otherwise immediately
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(() => moduleLoader());
            } else {
                moduleLoader();
            }
        }
    }, []);

    return { prefetch };
}
