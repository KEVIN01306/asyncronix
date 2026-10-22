import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { HashProvider } from "@shared/domain/hash.provider.js";
import type { EmailProvider } from "@shared/domain/providers/email.provider.js";
import type { ClienteActualizar, ClienteObtenidoDetalle, ConteoRelacionesCliente } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";
import { generarPasswordSegura } from "../domain/utils/generar-password.js";
import { normalizarDpi } from "../domain/utils/normalizar-dpi.js";
import { ClienteUnificacionTemplate } from "../../../shared/infrastructure/email/templates/cliente-unificacion.template.js";

export interface UnificarClientesDTO {
    clienteConservarId: string;
    clienteEliminarId: string;
    negocioId: string;
    usuarioId: string;
    adoptarDatosFaltantes?: boolean;
    datosFusionadosSobrescritos?: Partial<ClienteActualizar>;
}

export interface ResultadoUnificacion {
    clienteDefinitivo: ClienteObtenidoDetalle;
    relacionesMigradas: ConteoRelacionesCliente;
    notificacionEnviada: boolean;
}

export class UnificarClientesUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository,
        private readonly hashProvider: HashProvider,
        private readonly emailProvider?: EmailProvider
    ) { }

    async execute(dto: UnificarClientesDTO): Promise<ResultadoUnificacion> {
        const { clienteConservarId, clienteEliminarId, negocioId, usuarioId, adoptarDatosFaltantes = true, datosFusionadosSobrescritos } = dto;

        if (!clienteConservarId || !clienteEliminarId) {
            throw new AppError("Debes especificar el cliente a conservar y el cliente a eliminar", "INVALID_UNIFY_PARAMS", 400);
        }

        if (clienteConservarId === clienteEliminarId) {
            throw new AppError("No se puede unificar un cliente consigo mismo", "SAME_CLIENT_UNIFICATION", 400);
        }

        // 1. Validar que ambos clientes existan
        const [conservar, eliminar] = await Promise.all([
            this.clienteRepository.obtenerPorId(clienteConservarId),
            this.clienteRepository.obtenerPorId(clienteEliminarId)
        ]);

        if (!conservar) {
            throw new AppError("El cliente definitivo a conservar no existe", "TARGET_CLIENT_NOT_FOUND", 404);
        }

        if (!eliminar) {
            throw new AppError("El cliente a consolidar/eliminar no existe", "SOURCE_CLIENT_NOT_FOUND", 404);
        }

        // 2. Validar que al menos uno de los clientes esté asociado al negocio actual
        const conservarAsociado = await this.clienteRepository.estaAsociadoANegocio(clienteConservarId, negocioId);
        const eliminarAsociado = await this.clienteRepository.estaAsociadoANegocio(clienteEliminarId, negocioId);

        if (!conservarAsociado && !eliminarAsociado) {
            throw new AppError("Ninguno de los clientes seleccionados pertenece al negocio actual", "CLIENT_NOT_IN_BUSINESS", 403);
        }

        // 3. Estrategia de resolución de conflictos de datos personales:
        // Si adoptarDatosFaltantes es true (por defecto true):
        // Se preservan los datos del cliente a conservar. Si este tiene campos nulos o vacíos
        // y el cliente eliminado tiene datos válidos, se transfieren al cliente a conservar.
        const adoptar = adoptarDatosFaltantes !== false;

        const esNombreGenerico = (n?: string | null) => {
            if (!n) return true;
            const norm = n.trim().toUpperCase();
            return norm === "CF" || norm === "C/F" || norm === "CONSUMIDOR FINAL" || norm === "CLIENTE GENERAL";
        };

        const resolverCampo = (
            campoConservar: string | null | undefined,
            campoEliminar: string | null | undefined,
            sobrescrito: string | null | undefined
        ): string | null => {
            if (sobrescrito !== undefined) return sobrescrito?.trim() || null;
            const valConservar = campoConservar?.trim() || null;
            const valEliminar = campoEliminar?.trim() || null;
            if (valConservar) return valConservar;
            return adoptar ? valEliminar : null;
        };

        const nombreResolvido = (datosFusionadosSobrescritos?.nombre?.trim() || (
            esNombreGenerico(conservar.nombre) && !esNombreGenerico(eliminar.nombre) && adoptar
                ? (eliminar.nombre?.trim() || conservar.nombre)
                : conservar.nombre
        ));

        const dpiResolvido = normalizarDpi(resolverCampo(conservar.dpi, eliminar.dpi, datosFusionadosSobrescritos?.dpi));

        // Validar que el DPI resuelto no pertenezca a un tercer cliente en el sistema
        if (dpiResolvido && dpiResolvido !== normalizarDpi(conservar.dpi) && dpiResolvido !== normalizarDpi(eliminar.dpi)) {
            const clienteTercero = await this.clienteRepository.buscarPorDpi(dpiResolvido);
            if (clienteTercero && clienteTercero.id !== clienteConservarId && clienteTercero.id !== clienteEliminarId) {
                throw new AppError(
                    `El DPI ${dpiResolvido} ya pertenece a otro cliente registrado en la plataforma (${clienteTercero.nombre})`,
                    "DPI_ALREADY_EXISTS",
                    409
                );
            }
        }

        const datosFusionados: Partial<ClienteActualizar> = {
            ...datosFusionadosSobrescritos,
            nombre: nombreResolvido,
            apellido: resolverCampo(conservar.apellido, eliminar.apellido, datosFusionadosSobrescritos?.apellido),
            telefono: resolverCampo(conservar.telefono, eliminar.telefono, datosFusionadosSobrescritos?.telefono),
            email: resolverCampo(conservar.email, eliminar.email, datosFusionadosSobrescritos?.email),
            nit: resolverCampo(conservar.nit, eliminar.nit, datosFusionadosSobrescritos?.nit),
            dpi: dpiResolvido,
        };

        // Generar nuevas credenciales de acceso para el cliente definitivo tras la consolidación
        const nuevaPasswordPlana = generarPasswordSegura();
        let nuevaPasswordHash: string | null = null;
        try {
            nuevaPasswordHash = await this.hashProvider.hash(nuevaPasswordPlana);
        } catch (hashError) {
            console.error("Error al hashear contraseña tras unificación:", hashError);
        }

        if (nuevaPasswordHash) {
            (datosFusionados as any).password_hash = nuevaPasswordHash;
        }

        // 4. Ejecutar la unificación transaccional
        let relacionesMigradas: ConteoRelacionesCliente;
        try {
            const resultadoTx = await this.clienteRepository.unificar({
                clienteConservarId,
                clienteEliminarId,
                negocioId,
                usuarioId,
                datosFusionados
            });
            relacionesMigradas = resultadoTx.relacionesMigradas;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError("Error en base de datos al realizar la unificación", "DATABASE_ERROR", 500);
            }
            throw error;
        }

        // 5. Registro de auditoría del sistema
        console.log(`[AUDITORIA_UNIFICACION] Usuario ${usuarioId} en negocio ${negocioId} unificó cliente ${clienteEliminarId} en cliente ${clienteConservarId}. Relaciones migradas:`, relacionesMigradas);

        // 6. Obtener el cliente definitivo actualizado
        const clienteDefinitivo = await this.clienteRepository.obtenerPorId(clienteConservarId);

        // 7. Notificación al cliente por correo si dispone de email
        let notificacionEnviada = false;
        const emailDestino = clienteDefinitivo?.email || datosFusionados.email;

        if (emailDestino && this.emailProvider) {
            const dpiUsuario = clienteDefinitivo?.dpi || "tu DPI registrado";

            try {
                const html = ClienteUnificacionTemplate({
                    nombre: clienteDefinitivo?.nombre || "Cliente",
                    dpi: dpiUsuario,
                    password: nuevaPasswordPlana,
                });

                await this.emailProvider.sendEmail({
                    to: emailDestino,
                    subject: "Notificación de unificación de cuenta - Asyncronix",
                    html,
                });
                notificacionEnviada = true;
            } catch (emailErr: any) {
                console.warn(`[UNIFICACION_CLIENTES] No se pudo enviar el correo de notificación a ${emailDestino}:`, emailErr?.message || emailErr);
                notificacionEnviada = false;
            }
        }

        return {
            clienteDefinitivo: clienteDefinitivo!,
            relacionesMigradas,
            notificacionEnviada
        };
    }
}
