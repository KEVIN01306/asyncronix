import AppError from "@shared/errors/AppError.js";
import type { LoteCrear, LoteDetalle } from "../domain/lote.entity.js";
import type { LoteRepository } from "../domain/lote.repository.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";

export class RegistrarLoteUseCase {
    constructor(private readonly repository: LoteRepository) { }

    async execute(data: LoteCrear, negocio_id: string): Promise<LoteDetalle> {
        try {
            const generateCode = () => `LOT-${(data.variante_id || '').slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
            const codigo_lote = data.codigo_lote || generateCode();
            const payload = { ...data, codigo_lote };
            const creado = await this.repository.registrar(payload, negocio_id);
            return creado;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
