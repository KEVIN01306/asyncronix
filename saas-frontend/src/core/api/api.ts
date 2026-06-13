import axios from "axios";
import { handleApiError } from "./api-error-handler";
import type { ApiInstance } from "./interfaces/instance.interface";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
}) as ApiInstance;

const refreshApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

let isRefreshing = false;
let refreshQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    refreshQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    refreshQueue = [];
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const backendCode = error.response?.data?.code;

        if (status === 401 && backendCode === "TOKEN_EXPIRED" && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            isRefreshing = true;

            return new Promise((resolve, reject) => {
                refreshApi.post('/auth/refresh')
                    .then((refreshResponse) => {
                        const newAccessToken = refreshResponse.data?.data?.accessToken ?? refreshResponse.data?.accessToken;

                        if (!newAccessToken) {
                            throw new Error('No access token returned from refresh endpoint');
                        }

                        localStorage.setItem('accessToken', newAccessToken);
                        useAuthStore.getState().refreshToken(newAccessToken);

                        processQueue(null, newAccessToken);
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    })
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((refreshError) => {
                        processQueue(refreshError, null);
                        useAuthStore.getState().logout();
                        reject(refreshError);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError' || (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError')) {
            return Promise.reject(error);
        }

        handleApiError(error);
        return Promise.reject(error);
    }
);

export default api;