import AppError from "@shared/errors/AppError.js";
import type { Session } from "../domain/auth-session.entity.js";
import type { AuthRepository } from "../domain/auth.repository.js";
import type JwtProvider from "../domain/jwt.provider.js";



interface RefreshRespuesta {
    accessToken: string,
    refreshToken: string,
}


export class RefreshTokenUseCase {
    
    constructor (
        private readonly authRepository: AuthRepository,
        private readonly jWTProvider: JwtProvider
    ) {}

    async execute(token: Session['token']): Promise<RefreshRespuesta>{

        const payload = await this.jWTProvider.verifyToken(token)
        
        const sesionExistente = await this.authRepository.buscarSesionPorToken(token)

        if (!sesionExistente) {
            throw new AppError("No autorizado: Token no proporcionado", "UNAUTHORIZED", 401)
        }

        if (!payload.sub) {
            throw new AppError("Token mal formado: faltan claims", "INVALID_TOKEN_PAYLOAD", 401)
        }

        const usuario = await this.authRepository.buscarPorId(payload.sub)

        if (!usuario || !usuario.activo) {
            throw new AppError("Usuario no encontrado o inactivo", "USER_NOT_ALLOWED", 401)
        }

        const { accessToken, refreshToken  } = await this.jWTProvider.generateTokens(
            payload.sub,
            usuario.rol,
            usuario.negocio_id
        )

        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

        await this.authRepository.actualizarCrearSesion(
            payload.sub,
            refreshToken,
            fechaExpiracion
        )
    
        return {
            accessToken,
            refreshToken
        }
    }
}