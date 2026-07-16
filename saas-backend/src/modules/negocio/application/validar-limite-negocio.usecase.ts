import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { NegocioRepository } from "../domain/negocio.repository.js";
import { LimiteNegocio } from "../domain/negocio-limite.entity.js";

export class ValidarLimiteNegocioUseCase {
    constructor(
        private readonly negocioRepository: NegocioRepository
    ) { }

    async execute(negocioId: string, tipo: LimiteNegocio, cantidadActual: number): Promise<void> {
        try {
            const limites = await this.negocioRepository.obtenerLimites(negocioId);

            let maximo = -1;

            switch (tipo) {
                case LimiteNegocio.USUARIOS:
                    maximo = limites.max_usuarios;
                    break;
                case LimiteNegocio.SUCURSALES:
                    maximo = limites.max_sucursales;
                    break;
                case LimiteNegocio.PRODUCTOS:
                    maximo = limites.max_productos;
                    break;
                case LimiteNegocio.VARIANTES:
                    maximo = limites.max_variantes;
                    break;
                case LimiteNegocio.VEHICULOS:
                    maximo = limites.max_vehiculos;
                    break;
                case LimiteNegocio.CAJAS:
                    maximo = limites.max_cajas;
                    break;
                case LimiteNegocio.CUENTAS_BANCARIAS:
                    maximo = limites.max_cuentas_bancarias;
                    break;
            }

            if (maximo === -1) {
                return; // Ilimitado
            }

            if (cantidadActual >= maximo) {
                throw new AppError(
                    `El negocio ha alcanzado el número máximo de ${tipo.toLowerCase()} permitidos por su plan.`,
                    'LIMIT_EXCEEDED',
                    403
                );
            }
        } catch (error) {
            if (error instanceof AppError) throw error;

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos al validar límites', 'DATABASE_ERROR', 500)
            }

            throw error;
        }
    }
}
