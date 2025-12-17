/**
 * Global Axios Configuration
 * 
 * This file sets up axios interceptors globally so ALL axios requests 
 * (not just those using a custom instance) include the JWT token.
 * 
 * This approach is non-invasive - no need to change imports in existing files.
 */
import axios from 'axios';
import { auth } from './auth';

// Request interceptor: add JWT token to all axios requests
axios.interceptors.request.use(
    (config) => {
        const token = auth.getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: handle 401 errors globally
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only logout if not already on login page
            if (!window.location.pathname.includes('/login')) {
                auth.logout();
            }
        }
        return Promise.reject(error);
    }
);

export { };
