import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import type { ClienteRepository } from "../../cliente/domain/cliente.repository.js";
import { normalizarDpi } from "../../cliente/domain/utils/normalizar-dpi.js";

export class AsociarClienteVehiculoUseCase {
    constructor(
        private readonly vehiculoRepository: VehiculoRepository,
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(vehiculo_id: string, documento: string, negocio_id: string) {
        try {
            const cleanDoc = documento?.trim() || "";
            const dpi = normalizarDpi(cleanDoc);
            const nit = cleanDoc.toUpperCase();

            let cliente = null;
            if (dpi) {
                cliente = await this.clienteRepository.buscarPorDpi(dpi);
            }
            if (!cliente && nit && nit !== "CF" && nit !== "C/F") {
                cliente = await this.clienteRepository.buscarPorNit(nit);
            }

            if (!cliente) {
                throw new AppError("Cliente no encontrado con el documento proporcionado", "DATA_NOT_FOUND", 404);
            }

            // Reutilizar cliente global y asociar al negocio actual si aún no lo está
            const yaAsociado = await this.clienteRepository.estaAsociadoANegocio(cliente.id, negocio_id);
            if (!yaAsociado) {
                await this.clienteRepository.asociarNegocio(cliente.id, negocio_id);
            }

            const updated = await this.vehiculoRepository.actualizar(vehiculo_id, negocio_id, { cliente_id: cliente.id } as any);
            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError("Error en DB", "DATABASE_ERROR", 500);
            throw error;
        }
    }
}
