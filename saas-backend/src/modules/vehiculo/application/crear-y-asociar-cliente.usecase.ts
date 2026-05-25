import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import type { ClienteRepository } from "../../cliente/domain/cliente.repository.js";

export class CrearYAsociarClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository,
        private readonly vehiculoRepository: VehiculoRepository
    ) { }

    async execute(vehiculo_id: string, payload: { nombre: string; nit?: string | null; dpi?: string | null }, negocio_id: string) {
        try {
            // Crear telefono ficticio único para cumplir restricciones
            const telefonoFicticio = `0000000-${Date.now()}-${Math.random().toString(36).substring(2,8)}`;

            const cliente = await this.clienteRepository.registrar({
                nombre: payload.nombre,
                apellido: null,
                telefono: telefonoFicticio,
                email: null,
                nit: payload.nit ?? null,
                dpi: payload.dpi ?? null
            } as any, negocio_id);

            const updated = await this.vehiculoRepository.actualizar(vehiculo_id, negocio_id, { cliente_id: cliente.id } as any);
            return { cliente, vehiculo: updated };
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
