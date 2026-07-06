import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { BancoRepository } from "../domain/banco.repository.js";

export class ObtenerBancoUseCase {
    constructor(private readonly bancoRepository: BancoRepository) { }

    async execute(id: string) {
        try {
            return await this.bancoRepository.obtener(id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
