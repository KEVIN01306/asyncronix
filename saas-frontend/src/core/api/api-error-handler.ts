import { toast } from "sonner";
import { useAuthStore } from "../store/authStore";

const isAbortError = (error: any) => {
    if (!error) return false;
    if (typeof error === 'object') {
        return error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || (error instanceof DOMException && error.name === 'AbortError');
    }
    return false;
};

export const handleApiError = (error: any) => {
    if (isAbortError(error)) {
        return;
    }

    const status = error.response?.status;
    const data = error.response?.data;
    const backendMessage = error.response?.data?.message || "Error inesperado";
    const backendCode = data?.code;

    const errorMessages: Record<number, { title: string; desc?: string }> = {
        403: { title: "Acceso denegado", desc: "No tienes permisos para esto." },
        404: { title: "No encontrado", desc: "El recurso solicitado no existe." },
        500: { title: "Error de servidor", desc: "Lo sentimos, hubo un fallo interno." },
    };

    if (status === 401) {
        if (backendCode === "TOKEN_EXPIRED") {
            toast.error("Sesión expirada", {
                description: "Tu sesión ha caducado por seguridad. Inicia sesión de nuevo.",
            });
            useAuthStore.getState().logout();
            return;
        }

        if (backendCode === "INVALID_CREDENTIALS") {
            toast.error("Error de acceso", {
                description: "El numero o la contraseña son incorrectos.",
            });
            return;
        }

        toast.error("No autorizado", { description: "Debes iniciar sesión." });
        useAuthStore.getState().logout();
        return;
    }

    const errorDetail = errorMessages[status] || { title: backendMessage };

    toast.error(errorDetail.title, {
        description: errorDetail.desc,
    });
};