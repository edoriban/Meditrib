import { BrowserRouter as Router } from "react-router-dom";
import { Layout } from "./app/Layout";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


const queryClient = new QueryClient();


function App() {
  useEffect(() => {
    // Forzar modo oscuro por defecto
    document.documentElement.classList.add('light');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout />
      </Router>
    </QueryClientProvider>
  );
}

export default App;