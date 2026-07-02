import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import { ESTADO_SERVICIO } from "../domain/servicio.constants.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";

export class GuardarFirmaEntradaUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(servicio_id: string, firma_url: string, negocio_id: string) {
        try {
            const servicio = await this.repository.obtener(servicio_id, negocio_id);
            if (!servicio) throw new AppError('Servicio no encontrado', 'NOT_FOUND', 404);

            if (servicio.estado !== ESTADO_SERVICIO.RECEPCION) {
                throw new AppError('El servicio no está en estado RECEPCION', 'INVALID_STATE', 400);
            }

            if (!servicio.mecanico?.id) {
                throw new AppError('Debes asignar un mecánico antes de finalizar la recepción', 'MECANICO_REQUERIDO', 400);
            }

            return await this.repository.guardarFirmaEntrada(servicio_id, firma_url, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
