import AppError from '@shared/errors/AppError.js';
import type { CuentaBancariaRepository } from '../../cuenta-bancaria/domain/cuenta-bancaria.repository.js';
import type { CuentaBancariaObtenidoDetalle } from '../../cuenta-bancaria/domain/cuenta-bancaria.entity.js';

export class AcreditarCuentaBancariaUseCase {
    constructor(private readonly cuentaBancariaRepository: CuentaBancariaRepository) { }

    async execute(id: string, negocio_id: string, monto: number, monto_moneda_base: number, options?: { tx?: any }): Promise<CuentaBancariaObtenidoDetalle> {
        if (monto <= 0 || monto_moneda_base <= 0) {
            throw new AppError('El monto a acreditar debe ser mayor a cero', 'MONTO_INVALIDO', 400);
        }

        const cuenta = await this.cuentaBancariaRepository.obtener(id, negocio_id, options);
        if (!cuenta) {
            throw new AppError('La cuenta bancaria no existe', 'CUENTA_BANCARIA_NOT_FOUND', 404);
        }
        if (!cuenta.activo) {
            throw new AppError('La cuenta bancaria se encuentra inactiva', 'CUENTA_BANCARIA_INACTIVA', 400);
        }
        console.log(cuenta.saldo, cuenta.saldo_moneda_base)
        const nuevoSaldo = cuenta.saldo + monto;
        const nuevoSaldoMonedaBase = (cuenta.saldo_moneda_base || 0) + monto_moneda_base;
        console.log(nuevoSaldo, nuevoSaldoMonedaBase)

        return await this.cuentaBancariaRepository.actualizarSaldo(id, negocio_id, nuevoSaldo, nuevoSaldoMonedaBase, options);
    }
}
