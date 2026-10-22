import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { ClienteObtenidoDetalle } from "../../cliente/domain/cliente.entity.js";
import type { ClienteRepository } from "../../cliente/domain/cliente.repository.js";
import type { RegistrarClienteUseCase } from "../../cliente/application/registrar-cliente.usecase.js";
import { normalizarDpi } from "../../cliente/domain/utils/normalizar-dpi.js";

export interface RegistrarClienteVentaData {
    nombre: string;
    apellido?: string | null;
    nit?: string | null;
    dpi?: string | null;
    telefono?: string | null;
    email?: string | null;
}

export class RegistrarClienteParaVentaUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository,
        private readonly registrarClienteUseCase: RegistrarClienteUseCase
    ) { }

    async execute(data: RegistrarClienteVentaData, negocio_id: string): Promise<ClienteObtenidoDetalle> {
        try {
            const dpi = normalizarDpi(data.dpi);
            const nit = data.nit?.trim() ? data.nit.trim().toUpperCase() : null;

            return await this.registrarClienteUseCase.execute({
                nombre: data.nombre.trim(),
                apellido: data.apellido?.trim() || null,
                dpi,
                nit,
                telefono: data.telefono?.trim() || null,
                email: data.email?.trim() || null
            }, negocio_id);
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) {
                throw new AppError("Error en base de datos al registrar cliente para venta", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
