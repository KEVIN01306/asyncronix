import AppError from '@shared/errors/AppError.js';
import type { CuentaBancariaRepository } from '../../cuenta-bancaria/domain/cuenta-bancaria.repository.js';
import type { CuentaBancariaObtenidoDetalle } from '../../cuenta-bancaria/domain/cuenta-bancaria.entity.js';

export class DebitarCuentaBancariaUseCase {
    constructor(private readonly cuentaBancariaRepository: CuentaBancariaRepository) {}

    async execute(id: string, negocio_id: string, monto: number, monto_moneda_base: number, options?: { tx?: any }): Promise<CuentaBancariaObtenidoDetalle> {
        if (monto <= 0 || monto_moneda_base <= 0) {
            throw new AppError('El monto a debitar debe ser mayor a cero', 'MONTO_INVALIDO', 400);
        }

        const cuenta = await this.cuentaBancariaRepository.obtener(id, negocio_id, options);
        if (!cuenta) {
            throw new AppError('La cuenta bancaria no existe', 'CUENTA_BANCARIA_NOT_FOUND', 404);
        }
        if (!cuenta.activo) {
            throw new AppError('La cuenta bancaria se encuentra inactiva', 'CUENTA_BANCARIA_INACTIVA', 400);
        }
        if (cuenta.saldo < monto) {
            throw new AppError('Saldo insuficiente en la cuenta bancaria', 'SALDO_INSUFICIENTE', 400);
        }

        const nuevoSaldo = cuenta.saldo - monto;
        const nuevoSaldoMonedaBase = (cuenta.saldo_moneda_base || 0) - monto_moneda_base;
        
        return await this.cuentaBancariaRepository.actualizarSaldo(id, negocio_id, nuevoSaldo, nuevoSaldoMonedaBase, options);
    }
}
