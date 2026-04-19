import type { Request, Response, NextFunction } from "express";
import JwtProvider from "../../modules/auth/domain/jwt.provider.js";
import AppError from "../../shared/errors/AppError.js";

export class AuthMiddleware {
    private readonly jwtProvider: JwtProvider;

    constructor() {
        this.jwtProvider = new JwtProvider();
    }

    /**
     * Middleware principal para proteger rutas
     */
    public protegerRuta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new AppError("No autorizado: Token no proporcionado", "UNAUTHORIZED", 401);
            }

            const token = authHeader.split(" ")[1];

            const payload = await this.jwtProvider.verifyToken(String(token));

            res.locals.usuario = {
                id: payload.sub,
                rol: payload.rol,
                negocio_id: payload.negocio_id,
            };

            (req as any).usuario = res.locals.usuario;

            next();
        } catch (error: any) {
            if (error.code === 'ERR_JWT_EXPIRED') {
                next(new AppError("El token ha expirado", "TOKEN_EXPIRED", 401));
                return;
            }

            if (error instanceof AppError) {
                next(error);
            } else {
                next(new AppError("Token inválido o malformado", "INVALID_TOKEN", 401));
            }
        }
    };

    /**
     * Middleware opcional para validar roles (ADMIN)
     */
    public verificarRol = (rolesPermitidos: string[]) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const usuario = (req as any).usuario;

            if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
                return next(new AppError("No tienes permisos para realizar esta acción", "FORBIDDEN", 403));
            }

            next();
        };
    };
}