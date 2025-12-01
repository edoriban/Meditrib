import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./hooks/use-theme";
import axios from "axios";
import React, { Suspense } from "react";

const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const LoginPage = React.lazy(() => import("./pages/login/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/login/RegisterPage"));
const UsersPage = React.lazy(() => import("./pages/users/UsersPage"));
const MedicinesPage = React.lazy(() => import("./pages/inventory/MedicinesPage"));
const SuppliersPage = React.lazy(() => import("./pages/suppliers/SuppliersPage"));
const ClientsPage = React.lazy(() => import("./pages/clients/ClientsPage"));
const SalesPage = React.lazy(() => import("./pages/sales/SalesPage"));
const PurchaseOrderPage = React.lazy(() => import("./pages/purchase_orders/PurchaseOrderPage"));
const ReportsPage = React.lazy(() => import("./pages/reports/ReportsPage"));

const MainLayout = React.lazy(() => import("./layouts/MainLayout"));
const ProtectedRoute = React.lazy(() => import("./components/auth/ProtectedRoute"));

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando...</div>}>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Redirigir raíz a dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Usuarios */}
              <Route path="/users" element={
                <ProtectedRoute>
                  <MainLayout>
                    <UsersPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Inventario - Medicamentos */}
              <Route path="/medicines" element={
                <ProtectedRoute>
                  <MainLayout>
                    <MedicinesPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Proveedores */}
              <Route path="/suppliers" element={
                <ProtectedRoute>
                  <MainLayout>
                    <SuppliersPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Clientes */}
              <Route path="/clients" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ClientsPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Ventas */}
              <Route path="/sales" element={
                <ProtectedRoute>
                  <MainLayout>
                    <SalesPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Órdenes de Compra */}
              <Route path="/purchase-orders" element={
                <ProtectedRoute>
                  <MainLayout>
                    <PurchaseOrderPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Reportes */}
              <Route path="/reports" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ReportsPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Lotes - Placeholder por ahora */}
              <Route path="/batches" element={
                <ProtectedRoute>
                  <MainLayout>
                    <div className="p-6"><h1 className="text-2xl font-bold">Gestión de Lotes</h1><p className="text-muted-foreground mt-2">Próximamente...</p></div>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Alertas - Placeholder por ahora */}
              <Route path="/alerts" element={
                <ProtectedRoute>
                  <MainLayout>
                    <div className="p-6"><h1 className="text-2xl font-bold">Alertas</h1><p className="text-muted-foreground mt-2">Próximamente...</p></div>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Facturas - Placeholder por ahora */}
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <MainLayout>
                    <div className="p-6"><h1 className="text-2xl font-bold">Facturas</h1><p className="text-muted-foreground mt-2">Próximamente...</p></div>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Gastos - Placeholder por ahora */}
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <MainLayout>
                    <div className="p-6"><h1 className="text-2xl font-bold">Gastos</h1><p className="text-muted-foreground mt-2">Próximamente...</p></div>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Roles - Placeholder por ahora */}
              <Route path="/roles" element={
                <ProtectedRoute>
                  <MainLayout>
                    <div className="p-6"><h1 className="text-2xl font-bold">Gestión de Roles</h1><p className="text-muted-foreground mt-2">Próximamente...</p></div>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Configuración - Placeholder */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout>
                    <div className="p-6"><h1 className="text-2xl font-bold">Configuración</h1><p className="text-muted-foreground mt-2">Próximamente...</p></div>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Ayuda - Placeholder */}
              <Route path="/help" element={
                <ProtectedRoute>
                  <MainLayout>
                    <div className="p-6"><h1 className="text-2xl font-bold">Ayuda</h1><p className="text-muted-foreground mt-2">Próximamente...</p></div>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* 404 - Ruta no encontrada */}
              <Route path="*" element={
                <div className="flex items-center justify-center h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-muted-foreground">Página no encontrada</p>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;