import { meta, type ZodError } from "zod";

type CodigoError = string;
type Status = "success" | "error";

interface MetaPaginacion {
    total: number;
    limit: number;
    offset: number;
}

class Respuesta<T = any> {
    public readonly status: Status;
    public readonly code?: CodigoError;
    public readonly message: string;
    public readonly data: T | null;
    public readonly count?: number;
    public readonly meta?: MetaPaginacion;

    private constructor(
        status: Status,
        message: string,
        data: T | null,
        code?: CodigoError,
        meta?: MetaPaginacion,
    ) {
        this.status = status;
        this.message = message;
        this.data = data;
        if (code) this.code = code;

        if (meta) {
            this.meta = meta;
            if (Array.isArray(data)) this.count = data.length;
        } else if (Array.isArray(data)) {
            this.count = data.length;
        }
    };

    static exito<T>(message: string, data: T): Respuesta<T> {
        return new Respuesta('success', message, data);
    };

    static paginacion<T>(message: string, data: T[], total: number, limit: number, offset: number): Respuesta<T[]> {
        return new Respuesta('success', message, data, undefined, { total, limit, offset });
    }

    static error(message: string, code: CodigoError): Respuesta<null> {
        return new Respuesta('error', message, null, code);
    };

    static validacion(error: ZodError): Respuesta<any> {
        const mensajeLimpio = error.issues
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join(", ");

        return new Respuesta(
            'error',
            `Error de validación: ${mensajeLimpio}`,
            error.flatten().fieldErrors,
            'VALIDATION_ERROR'
        );
    }
};

export default Respuesta;