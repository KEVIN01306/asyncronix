import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";

export class EliminarClienteUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(id: string, _negocio_id: string): Promise<void> {
        try {
            const relaciones = await this.clienteRepository.obtenerConteoRelaciones(id);
            const totalRelaciones =
                relaciones.vehiculos +
                relaciones.citas +
                relaciones.servicios +
                relaciones.ventas +
                relaciones.pre_ventas +
                relaciones.cotizaciones +
                relaciones.facturas;

            if (totalRelaciones > 0) {
                throw new AppError(
                    "No se puede eliminar el cliente porque posee registros históricos asociados (ventas, vehículos o servicios). Utilice la opción de unificación si desea consolidarlo.",
                    "CLIENT_HAS_HISTORICAL_RELATIONS",
                    409
                );
            }

            await this.clienteRepository.eliminar(id);
        } catch (error) {
            if (error instanceof AppError) throw error;

            if (error instanceof NotFoundPersistenceError) {
                throw new AppError("No se encontró el cliente para eliminar", "DATA_NOT_FOUND", 404);
            }

            if (error instanceof DatabaseError) {
                throw new AppError("Error en base de datos al eliminar el cliente", "DATABASE_ERROR", 500);
            }

            throw error;
        }
    }
}
