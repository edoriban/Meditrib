import { BASE_API_URL } from "@/config";
import { User } from "@/types/user";

export const auth = {
    isAuthenticated: (): boolean => {
        return localStorage.getItem('token') !== null;
    },

    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    logout: (): void => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    },

    getCurrentUser: async (): Promise<User | null> => {
        const token = auth.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${BASE_API_URL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    auth.logout();
                    return null;
                }
                throw new Error('Error al obtener usuario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            return null;
        }
    },
};