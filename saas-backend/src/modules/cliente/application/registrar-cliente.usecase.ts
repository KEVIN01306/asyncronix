import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import type { EmailProvider } from "@shared/domain/providers/email.provider.js";
import type { ClienteActualizar, ClienteCrear, ClienteObtenidoDetalle } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";
import { normalizarDpi } from "../domain/utils/normalizar-dpi.js";
import { generarPasswordSegura } from "../domain/utils/generar-password.js";
import { ClienteBienvenidaTemplate } from "../../../shared/infrastructure/email/templates/cliente-bienvenida.template.js";

export class RegistrarClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository,
        private readonly hashProvider: HashProvider,
        private readonly emailProvider?: EmailProvider
    ) { }

    async execute(data: ClienteCrear, negocio_id: string): Promise<ClienteObtenidoDetalle> {
        const dpiNormalizado = normalizarDpi(data.dpi);
        const nitRaw = data.nit?.trim() ? data.nit.trim().toUpperCase() : null;
        const nitValido = nitRaw && nitRaw !== "CF" && nitRaw !== "C/F" ? nitRaw : null;

        const dataPreparada: ClienteCrear = {
            ...data,
            dpi: dpiNormalizado,
            nit: nitRaw,
            telefono: data.telefono?.trim() || null,
            email: data.email?.trim() || null,
            apellido: data.apellido?.trim() || null,
        };

        // 1. Verificar si el cliente ya existe globalmente:
        // Primero por DPI (identificador principal global)
        let clienteExistente: ClienteObtenidoDetalle | null = null;
        if (dpiNormalizado) {
            clienteExistente = await this.clienteRepository.buscarPorDpi(dpiNormalizado);
        }

        // Si no se encontró por DPI pero se proporcionó un NIT válido, verificar si ya existe por NIT
        // (por ejemplo, registrado previamente en una venta del POS o facturación)
        if (!clienteExistente && nitValido) {
            clienteExistente = await this.clienteRepository.buscarPorNit(nitValido);
        }

        // Caso B: El cliente ya existe globalmente (por DPI o por NIT previo)
        if (clienteExistente) {
            let debeActualizar = false;
            const actualizacion: ClienteActualizar = {};

            const esNombreGenerico = (n?: string | null) => {
                if (!n) return true;
                const norm = n.trim().toUpperCase();
                return norm === "CF" || norm === "C/F" || norm === "CONSUMIDOR FINAL" || norm === "CLIENTE GENERAL";
            };

            // Si el cliente existente no tenía DPI (ej. creado en venta rápida) y ahora se ingresa su DPI:
            if (!clienteExistente.dpi?.trim() && dpiNormalizado) {
                actualizacion.dpi = dpiNormalizado;
                debeActualizar = true;
            }

            // Completar campos faltantes si ahora se proporcionan
            if (!clienteExistente.nit?.trim() && nitValido) {
                actualizacion.nit = nitValido;
                debeActualizar = true;
            }
            if (esNombreGenerico(clienteExistente.nombre) && !esNombreGenerico(dataPreparada.nombre)) {
                actualizacion.nombre = dataPreparada.nombre;
                debeActualizar = true;
            }
            if (!clienteExistente.apellido?.trim() && dataPreparada.apellido?.trim()) {
                actualizacion.apellido = dataPreparada.apellido.trim();
                debeActualizar = true;
            }
            if (!clienteExistente.telefono?.trim() && dataPreparada.telefono?.trim()) {
                actualizacion.telefono = dataPreparada.telefono.trim();
                debeActualizar = true;
            }
            if (!clienteExistente.email?.trim() && dataPreparada.email?.trim()) {
                actualizacion.email = dataPreparada.email.trim();
                debeActualizar = true;
            }

            // Si no tenía credenciales y ahora cuenta con DPI o se le asignó uno:
            let passwordPlanaParaEnvio: string | null = null;
            const dpiFinal = actualizacion.dpi || clienteExistente.dpi;
            if (!clienteExistente.password_hash && dpiFinal) {
                passwordPlanaParaEnvio = data.password || generarPasswordSegura();
                try {
                    const hash = await this.hashProvider.hash(passwordPlanaParaEnvio);
                    actualizacion.password_hash = hash;
                    debeActualizar = true;
                } catch (hashErr) {
                    console.error("Error al hashear password para cliente existente:", hashErr);
                }
            }

            if (debeActualizar) {
                await this.clienteRepository.actualizar(clienteExistente.id, actualizacion);
            }

            // Asociar al negocio actual de forma idempotente
            const yaAsociado = await this.clienteRepository.estaAsociadoANegocio(clienteExistente.id, negocio_id);
            if (!yaAsociado) {
                await this.clienteRepository.asociarNegocio(clienteExistente.id, negocio_id);
            }

            // Si se generaron credenciales por primera vez para este cliente existente, notificarle
            const emailDestino = actualizacion.email || clienteExistente.email;
            if (passwordPlanaParaEnvio && emailDestino && dpiFinal && this.emailProvider) {
                const html = ClienteBienvenidaTemplate({
                    nombre: clienteExistente.nombre,
                    dpi: dpiFinal,
                    password: passwordPlanaParaEnvio,
                });

                this.emailProvider.sendEmail({
                    to: emailDestino,
                    subject: "Bienvenido a Asyncronix - Credenciales de acceso a tu portal",
                    html,
                }).catch((emailError) => {
                    console.warn(`[REGISTRO_CLIENTE] No se pudo enviar el correo a ${emailDestino}:`, emailError?.message || emailError);
                });
            }

            const detalleActualizado = await this.clienteRepository.obtenerPorId(clienteExistente.id);
            return {
                ...(detalleActualizado || clienteExistente),
                reutilizado: true
            };
        }

        // Caso A: El cliente no existe globalmente -> Crear nueva identidad y credenciales
        const passwordPlana = data.password || generarPasswordSegura();
        let passwordHash: string | null = null;
        try {
            passwordHash = await this.hashProvider.hash(passwordPlana);
        } catch (err) {
            console.error("Error al hashear contraseña del cliente:", err);
            passwordHash = null;
        }

        try {
            const clienteCreado = await this.clienteRepository.registrar(dataPreparada, passwordHash, negocio_id);

            // Envío de correo asíncrono seguro usando la plantilla dedicada
            if (clienteCreado.email && this.emailProvider) {
                const usuarioAcceso = clienteCreado.dpi || clienteCreado.nit || "tu número de documento";
                const html = ClienteBienvenidaTemplate({
                    nombre: clienteCreado.nombre,
                    dpi: usuarioAcceso,
                    password: passwordPlana,
                });

                this.emailProvider.sendEmail({
                    to: clienteCreado.email,
                    subject: "Bienvenido a Asyncronix - Credenciales de acceso a tu portal",
                    html,
                }).catch((emailError) => {
                    console.warn(`[REGISTRO_CLIENTE] No se pudo enviar el correo de bienvenida a ${clienteCreado.email}:`, emailError?.message || emailError);
                });
            }

            return {
                ...clienteCreado,
                reutilizado: false
            };
        } catch (error) {
            // Manejo concurrente: si otra petición insertó el mismo DPI o NIT exactamente al mismo tiempo
            if (error instanceof UniqueConstraintError && dpiNormalizado) {
                const clienteExistente = await this.clienteRepository.buscarPorDpi(dpiNormalizado);
                if (clienteExistente) {
                    await this.clienteRepository.asociarNegocio(clienteExistente.id, negocio_id);
                    const detalle = await this.clienteRepository.obtenerPorId(clienteExistente.id);
                    return {
                        ...(detalle || clienteExistente),
                        reutilizado: true
                    };
                }
            }

            if (error instanceof DatabaseError) {
                throw new AppError("Error en base de datos al registrar cliente", "DATABASE_ERROR", 500);
            }

            throw error;
        }
    }
}
