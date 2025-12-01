import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
          <Suspense fallback={<div>Cargando...</div>}>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Rutas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <MainLayout>
                    <UsersPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/medicines" element={
                <ProtectedRoute>
                  <MainLayout>
                    <MedicinesPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/suppliers" element={
                <ProtectedRoute>
                  <MainLayout>
                    <SuppliersPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/clients" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ClientsPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/sales" element={
                <ProtectedRoute>
                  <MainLayout>
                    <SalesPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/purchase-orders" element={
                <ProtectedRoute>
                  <MainLayout>
                    <PurchaseOrderPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ReportsPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;