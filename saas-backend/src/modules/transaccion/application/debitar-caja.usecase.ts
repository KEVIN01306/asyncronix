import AppError from '@shared/errors/AppError.js';
import type { CajaRepository } from '../../caja/domain/caja.repository.js';
import type { CajaObtenidoDetalle } from '../../caja/domain/caja.entity.js';

export class DebitarCajaUseCase {
    constructor(private readonly cajaRepository: CajaRepository) {}

    async execute(id: string, negocio_id: string, sucursal_id: string, monto: number, options?: { tx?: any }): Promise<CajaObtenidoDetalle> {
        const montoNum = Number(monto);
        if (isNaN(montoNum) || montoNum <= 0) {
            throw new AppError('El monto a debitar debe ser mayor a cero', 'MONTO_INVALIDO', 400);
        }

        const caja = await this.cajaRepository.obtener(id, negocio_id, sucursal_id, options);
        if (!caja) {
            throw new AppError('La caja no existe', 'CAJA_NOT_FOUND', 404);
        }
        if (!caja.activo) {
            throw new AppError('La caja se encuentra inactiva', 'CAJA_INACTIVA', 400);
        }
        const saldoActual = Number(caja.saldo) || 0;
        if (saldoActual < montoNum) {
            throw new AppError('La caja no posee saldo suficiente para completar la operación', 'SALDO_INSUFICIENTE', 400);
        }

        const nuevoSaldo = Number((saldoActual - montoNum).toFixed(2));
        
        return await this.cajaRepository.actualizarSaldo(id, negocio_id, sucursal_id, nuevoSaldo, options);
    }
}
