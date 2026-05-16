import axios from "axios";
import { handleApiError } from "./api-error-handler";
import type { ApiInstance } from "./interfaces/instance.interface";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
}) as ApiInstance;

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
    (error) => {
        handleApiError(error)
        return Promise.reject(error);
    }
)

export default api;