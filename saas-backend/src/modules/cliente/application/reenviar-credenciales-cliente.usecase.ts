import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import type { EmailProvider } from "@shared/domain/providers/email.provider.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";
import { generarPasswordSegura } from "../domain/utils/generar-password.js";
import { ClienteReenvioCredencialesTemplate } from "../../../shared/infrastructure/email/templates/cliente-reenvio-credenciales.template.js";

export interface ResultadoReenvioCredenciales {
    clienteId: string;
    nombre: string;
    email: string;
    dpi: string;
    notificacionEnviada: boolean;
}

export class ReenviarCredencialesClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository,
        private readonly hashProvider: HashProvider,
        private readonly emailProvider?: EmailProvider
    ) { }

    async execute(clienteId: string, negocioId: string): Promise<ResultadoReenvioCredenciales> {
        if (!clienteId?.trim()) {
            throw new AppError("ID de cliente requerido", "INVALID_CLIENT_ID", 400);
        }

        // 1. Obtener y validar existencia del cliente
        const cliente = await this.clienteRepository.obtenerPorId(clienteId);
        if (!cliente) {
            throw new AppError("El cliente no fue encontrado", "CLIENT_NOT_FOUND", 404);
        }

        // 2. Validar que pertenezca al negocio actual
        const estaAsociado = await this.clienteRepository.estaAsociadoANegocio(clienteId, negocioId);
        if (!estaAsociado) {
            throw new AppError("El cliente no está asociado a este negocio", "CLIENT_NOT_IN_BUSINESS", 403);
        }

        // 3. Validar que tenga un correo registrado
        const emailDestino = cliente.email?.trim();
        if (!emailDestino) {
            throw new AppError(
                "El cliente no tiene un correo electrónico registrado. Por favor edita su perfil y agrega un correo antes de reenviarle credenciales.",
                "CLIENT_NO_EMAIL",
                400
            );
        }

        // 4. Generar nueva contraseña y hashearla con Argon2
        const nuevaPassword = generarPasswordSegura();
        let passwordHash: string;
        try {
            passwordHash = await this.hashProvider.hash(nuevaPassword);
        } catch (hashError) {
            console.error("Error al hashear nueva contraseña para cliente:", hashError);
            throw new AppError("Error de seguridad al procesar las credenciales", "HASH_ERROR", 500);
        }

        // 5. Actualizar hash en base de datos y revocar sesiones activas
        try {
            await this.clienteRepository.actualizar(clienteId, { password_hash: passwordHash });
            await this.clienteRepository.eliminarSesiones(clienteId);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error al actualizar las credenciales en base de datos", "DATABASE_ERROR", 500);
            }
            throw error;
        }

        // 6. Enviar correo con la plantilla dedicada
        let notificacionEnviada = false;
        const usuarioAcceso = cliente.dpi?.trim() || cliente.nit?.trim() || "tu número de documento";
        const nombreCompleto = `${cliente.nombre}${cliente.apellido ? ' ' + cliente.apellido : ''}`;

        if (this.emailProvider) {
            try {
                const html = ClienteReenvioCredencialesTemplate({
                    nombre: nombreCompleto,
                    dpi: usuarioAcceso,
                    password: nuevaPassword,
                });

                await this.emailProvider.sendEmail({
                    to: emailDestino,
                    subject: "Nuevas credenciales de acceso a tu portal - Asyncronix",
                    html,
                });
                notificacionEnviada = true;
            } catch (emailError: any) {
                console.warn(`[REENVIO_CREDENCIALES] No se pudo enviar el correo a ${emailDestino}:`, emailError?.message || emailError);
                notificacionEnviada = false;
            }
        }

        return {
            clienteId: cliente.id,
            nombre: nombreCompleto,
            email: emailDestino,
            dpi: usuarioAcceso,
            notificacionEnviada
        };
    }
}
