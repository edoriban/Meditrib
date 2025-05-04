import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./hooks/use-theme";
import axios from "axios";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/login/LoginPage";
import RegisterPage from "./pages/login/RegisterPage";
import UsersPage from "./pages/users/UsersPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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

            {/* Más rutas protegidas aquí */}
          </Routes>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;