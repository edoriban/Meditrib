import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "@/utils/auth";
import { Skeleton } from "@/components/ui/skeleton"; // Asegúrate de tener un componente de carga

interface ProtectedRouteProps {
    children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Verificar si el usuario está autenticado
                const isAuth = auth.isAuthenticated();

                if (isAuth) {
                    // Verificar si el token es válido haciendo una petición al endpoint /users/me
                    const currentUser = await auth.getCurrentUser();
                    setIsAuthenticated(!!currentUser);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Skeleton className="w-[100px] h-[20px] rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redireccionar a la página de login guardando la ruta actual para volver después
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;