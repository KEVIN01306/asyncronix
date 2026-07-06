import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { SucursalMiDetalle } from "../domain/sucursal.entity.js";
import type { SucursalRepository } from "../domain/sucursal.repository.js";

export class AsignarCuentaBancariaSucursalUseCase {
    constructor(private readonly sucursalRepository: SucursalRepository) { }

    async execute(
        negocio_id: string,
        sucursal_id: string,
        cuenta_bancaria_id: string,
        metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO'
    ): Promise<SucursalMiDetalle> {
        try {
            const sucursal = await this.sucursalRepository.asignarCuentaBancaria(
                negocio_id,
                sucursal_id,
                cuenta_bancaria_id,
                metodo_pago
            );

            if (!sucursal) {
                throw new AppError('No se encontró la sucursal', 'DATA_NOT_FOUND', 404);
            }

            return sucursal;
        } catch (error) {
            if (error instanceof AppError) throw error;

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }

            throw error;
        }
    }
}
