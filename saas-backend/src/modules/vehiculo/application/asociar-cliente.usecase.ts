import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import type { ClienteRepository } from "../../cliente/domain/cliente.repository.js";

export class AsociarClienteVehiculoUseCase {
    constructor(
        private readonly vehiculoRepository: VehiculoRepository,
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(vehiculo_id: string, nit: string, negocio_id: string) {
        try {
            const cliente = await this.clienteRepository.buscarPorDocumento({ nit, dpi: null }, negocio_id);
            if (!cliente) throw new AppError('Cliente no encontrado', 'DATA_NOT_FOUND', 404);

            const updated = await this.vehiculoRepository.actualizar(vehiculo_id, negocio_id, { cliente_id: cliente.id } as any);
            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
