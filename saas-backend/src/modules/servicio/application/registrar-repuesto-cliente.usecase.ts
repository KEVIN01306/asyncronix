import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioRepuestoCliente, ServicioRepuestoClienteCrear } from "../domain/servicio.entity.js";

export class RegistrarRepuestoClienteUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(data: ServicioRepuestoClienteCrear, servicio_id: string, negocio_id: string): Promise<ServicioRepuestoCliente> {
        try {
            return await this.repository.registrarRepuestoCliente(data, servicio_id, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}

export default RegistrarRepuestoClienteUseCase;
