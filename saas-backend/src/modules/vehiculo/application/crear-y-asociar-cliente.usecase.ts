import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import type { RegistrarClienteUseCase } from "../../cliente/application/registrar-cliente.usecase.js";

export class CrearYAsociarClienteUseCase {
    constructor(
        private readonly registrarClienteUseCase: RegistrarClienteUseCase,
        private readonly vehiculoRepository: VehiculoRepository
    ) { }

    async execute(
        vehiculo_id: string,
        payload: {
            nombre: string;
            apellido?: string | null;
            nit?: string | null;
            dpi?: string | null;
            telefono?: string | null;
            email?: string | null;
        },
        negocio_id: string
    ) {
        try {
            const cliente = await this.registrarClienteUseCase.execute({
                nombre: payload.nombre.trim(),
                apellido: payload.apellido?.trim() || null,
                dpi: payload.dpi ?? null,
                nit: payload.nit ?? null,
                telefono: payload.telefono?.trim() || null,
                email: payload.email?.trim() || null,
            }, negocio_id);

            const updated = await this.vehiculoRepository.actualizar(vehiculo_id, negocio_id, { cliente_id: cliente.id } as any);
            return { cliente, vehiculo: updated };
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError("Error en DB al asociar cliente a vehículo", "DATABASE_ERROR", 500);
            throw error;
        }
    }
}
