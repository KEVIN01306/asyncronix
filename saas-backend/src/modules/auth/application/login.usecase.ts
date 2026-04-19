import AppError from "@shared/errors/AppError.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import type { AuthRepository } from "../domain/auth.repository.js";
import type JwtProvider from "../domain/jwt.provider.js";



interface LoginDTO {
    telefono: string,
    password: string,
}

interface LoginRespuesta {
    accessToken: string,
    refreshToken: string,
    usuario: {
        id: string,
        nombre: string,
        rol: string,
        negocio_id: string,
    }
}

export class LoginUseCase {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwtProvider: JwtProvider,
        private readonly hashProvider: HashProvider
    ) { }

    async execute(data: LoginDTO): Promise<LoginRespuesta> {
        const { telefono, password } = data

        const usuario = await this.authRepository.buscarPorTelefono(telefono)

        if (!usuario) {
            throw new AppError("Credenciales invalidas", "INVALID_CREDENTIALS", 401)
        }

        if (usuario.password_hash === null) {
            throw new AppError("Usuario no tiene contraseña", "USER_NO_PASSWORD", 403)
        }

        if (!usuario.activo) {
            throw new AppError("Usuario inactivo", "USER_INACTIVE", 403)
        }
        let esValido = false
        try {
            esValido = await this.hashProvider.compare(password, usuario.password_hash)
        } catch (error) {
            console.log("Error al comparar la contraseña", error);
            throw new AppError("Error al comparar la contraseña", "INVALID_CREDENTIALS", 401)
        }

        if (!esValido) {
            throw new AppError("Credenciales invalidas", "INVALID_CREDENTIALS", 401)
        }

        const { accessToken, refreshToken } = await this.jwtProvider.generateTokens(usuario.id, usuario.rol, usuario.negocio_id)

        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

        await this.authRepository.actualizarCrearSesion(
            usuario.id,
            refreshToken,
            fechaExpiracion
        )

        return {
            accessToken,
            refreshToken,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol,
                negocio_id: usuario.negocio_id,
            }
        }
    }
}