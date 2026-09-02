import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ProcedenciaRepuesto } from "../domain/servicio.entity.js";

interface CrearRepuestoSolicitadoData {
    descripccion: string;
    cantidad: number;
    instrucciones: string;
    procedencia: ProcedenciaRepuesto;
    entregado?: boolean;
}

export class AdministrarRepuestoSolicitadoUseCase {
    constructor(private readonly repository: ServicioRepository) {}

    async crear(reparacion_id: string, data: CrearRepuestoSolicitadoData, negocio_id: string) {
        try {
            return await this.repository.crearReparacionRepuesto(reparacion_id, data as any, negocio_id);
        } catch (error) {
            throw new AppError('Error al crear el repuesto solicitado', 'DATABASE_ERROR', 500);
        }
    }

    async actualizar(id: string, reparacion_id: string, data: Partial<CrearRepuestoSolicitadoData>, negocio_id: string) {
        try {
            return await this.repository.actualizarReparacionRepuesto(id, reparacion_id, data as any, negocio_id);
        } catch (error) {
            throw new AppError('Error al actualizar el repuesto solicitado', 'DATABASE_ERROR', 500);
        }
    }

    async eliminar(id: string, reparacion_id: string, negocio_id: string) {
        try {
            await this.repository.eliminarReparacionRepuesto(id, reparacion_id, negocio_id);
        } catch (error) {
            throw new AppError('Error al eliminar el repuesto solicitado', 'DATABASE_ERROR', 500);
        }
    }

    async marcarEntregado(id: string, reparacion_id: string, entregado: boolean, negocio_id: string) {
        try {
            return await this.repository.actualizarReparacionRepuesto(id, reparacion_id, { entregado }, negocio_id);
        } catch (error) {
            throw new AppError('Error al cambiar el estado del repuesto', 'DATABASE_ERROR', 500);
        }
    }
}
