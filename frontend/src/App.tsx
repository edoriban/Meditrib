import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./app/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./hooks/use-theme";
import axios from "axios";

// Configuración global de axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Cliente de React Query para gestionar las consultas a la API
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
          <Layout children={undefined} />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;