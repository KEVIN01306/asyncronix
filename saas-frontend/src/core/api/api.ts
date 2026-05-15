import axios, { type AxiosError } from "axios";
import { handleApiError } from "./api-error-handler";
import type { ApiInstance } from "./interfaces/instance.interface";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
}) as ApiInstance;

// Flag y cola para manejar refresh de token
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    isRefreshing = false;
    failedQueue = [];
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers){
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
})

api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // Si es 401 y no es una petición de refresh, intentar refrescar
        if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/refresh')) {
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Hacer petición de refresh
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_URL}/auth/refresh`,
                        {},
                        {
                            baseURL: import.meta.env.VITE_API_URL,
                            withCredentials: true
                        }
                    );

                    const { accessToken } = response.data;
                    localStorage.setItem('accessToken', accessToken);

                    // Actualizar el token en la petición original
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    // Procesar la cola de peticiones pendientes
                    processQueue(null, accessToken);

                    // Reintentar la petición original
                    return api(originalRequest);

                } catch (err) {
                    // Si el refresh falla, hacer logout
                    processQueue(err as AxiosError, null);

                    const { useAuthStore } = await import("../store/authStore");
                    useAuthStore.getState().logout();

                    return Promise.reject(err);
                }
            } else {
                // Si ya está refrescando, agregar a la cola
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: () => {
                            originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
                            resolve(api(originalRequest));
                        },
                        reject: (err: AxiosError) => {
                            reject(err);
                        }
                    });
                });
            }
        }

        handleApiError(error)
        return Promise.reject(error);
    }
)

export default api;