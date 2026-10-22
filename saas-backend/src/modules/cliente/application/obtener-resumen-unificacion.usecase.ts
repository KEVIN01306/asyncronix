import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { ResumenUnificacion } from "../domain/cliente.entity.js";
import type { ClienteRepository } from "../domain/cliente.repository.js";

export class ObtenerResumenUnificacionUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(origenId: string, destinoId: string, _negocioId: string): Promise<ResumenUnificacion> {
        try {
            if (origenId === destinoId) {
                throw new AppError("Los identificadores de origen y destino deben ser diferentes", "SAME_CLIENT_UNIFICATION", 400);
            }

            const [origen, destino] = await Promise.all([
                this.clienteRepository.obtenerPorId(origenId),
                this.clienteRepository.obtenerPorId(destinoId)
            ]);

            if (!origen) {
                throw new AppError("El cliente de origen no existe", "SOURCE_CLIENT_NOT_FOUND", 404);
            }

            if (!destino) {
                throw new AppError("El cliente de destino no existe", "TARGET_CLIENT_NOT_FOUND", 404);
            }

            const relaciones_a_migrar = await this.clienteRepository.obtenerConteoRelaciones(origenId);

            return {
                origen,
                destino,
                relaciones_a_migrar
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) {
                throw new AppError("Error en base de datos al obtener resumen de unificación", "DATABASE_ERROR", 500);
            }
            throw error;
        }
    }
}
