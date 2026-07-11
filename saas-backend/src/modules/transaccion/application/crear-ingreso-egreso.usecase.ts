import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { TransaccionCrear, IngresoEgresoEntity } from '../domain/transaccion.entity.js';
import type { TransaccionRepository } from '../domain/transaccion.repository.js';
import type { ExchangeRateProvider } from '@shared/domain/providers/ExchangeRateProvider.js';
import type { AcreditarCajaUseCase } from './acreditar-caja.usecase.js';
import type { DebitarCajaUseCase } from './debitar-caja.usecase.js';
import type { AcreditarCuentaBancariaUseCase } from './acreditar-cuenta-bancaria.usecase.js';
import type { DebitarCuentaBancariaUseCase } from './debitar-cuenta-bancaria.usecase.js';

interface CajaData {
    id: string;
    moneda_id?: string;
}

interface CuentaBancariaData {
    id: string;
    moneda_id: string | null;
}

interface NegocioData {
    moneda_id: string;
}

interface MonedaData {
    codigo: string;
}

export class CrearIngresoEgresoUseCase {
    constructor(
        private readonly transaccionRepository: TransaccionRepository,
        private readonly exchangeRateProvider: ExchangeRateProvider,
        private readonly obtenerCaja: (id: string) => Promise<CajaData | null>,
        private readonly obtenerCuenta: (id: string) => Promise<CuentaBancariaData | null>,
        private readonly obtenerNegocio: (id: string) => Promise<NegocioData | null>,
        private readonly obtenerMoneda: (id: string) => Promise<MonedaData | null>,
        private readonly acreditarCaja: AcreditarCajaUseCase,
        private readonly debitarCaja: DebitarCajaUseCase,
        private readonly acreditarCuenta: AcreditarCuentaBancariaUseCase,
        private readonly debitarCuenta: DebitarCuentaBancariaUseCase
    ) { }

    async execute(
        data: TransaccionCrear,
        negocio_id: string,
        sucursal_id: string,
        usuario_id: string
    ): Promise<IngresoEgresoEntity> {
        try {
            const negocio = await this.obtenerNegocio(negocio_id);
            if (!negocio) {
                throw new AppError('Negocio no encontrado', 'NEGOCIO_NOT_FOUND', 404);
            }

            let moneda_id = data.moneda_id || negocio.moneda_id;
            const moneda = await this.obtenerMoneda(moneda_id);
            if (!moneda) {
                throw new AppError('Moneda no válida', 'MONEDA_INVALID', 400);
            }

            let processedData: TransaccionCrear;

            if (data.entidad_tipo === 'CAJA') {
                const caja = await this.obtenerCaja(data.entidad_id);
                if (!caja) {
                    throw new AppError('Caja no encontrada', 'CAJA_NOT_FOUND', 404);
                }

                // Cajas always use the business base currency
                processedData = {
                    ...data,
                    moneda_id: negocio.moneda_id,
                    moneda_actual_id: negocio.moneda_id,
                    tipo_cambio: 1.0,
                    monto_moneda_base: data.monto_original,
                };
            } else if (data.entidad_tipo === 'CUENTA') {
                const cuenta = await this.obtenerCuenta(data.entidad_id);
                if (!cuenta) {
                    throw new AppError('Cuenta bancaria no encontrada', 'CUENTA_NOT_FOUND', 404);
                }

                const cuentaMonedaId = cuenta.moneda_id || negocio.moneda_id;
                const cuentaMoneda = await this.obtenerMoneda(cuentaMonedaId);
                if (!cuentaMoneda) {
                    throw new AppError('Moneda de la cuenta no válida', 'MONEDA_INVALID', 400);
                }

                const negocioMoneda = await this.obtenerMoneda(negocio.moneda_id);
                if (!negocioMoneda) {
                    throw new AppError('Moneda del negocio no válida', 'MONEDA_INVALID', 400);
                }

                if (cuentaMonedaId === negocio.moneda_id) {
                    // Same currency — no conversion needed
                    processedData = {
                        ...data,
                        moneda_id: negocio.moneda_id,
                        moneda_actual_id: negocio.moneda_id,
                        tipo_cambio: 1.0,
                        monto_moneda_base: data.monto_original,
                    };
                } else {
                    // Different currencies — apply FX conversion
                    const exchangeRate = await this.exchangeRateProvider.getRate(
                        negocioMoneda.codigo,
                        cuentaMoneda.codigo
                    );

                    let monto_original: number;
                    let monto_moneda_base: number;

                    if (data.monto_moneda_base !== undefined) {
                        // User entered amount in base currency
                        monto_moneda_base = data.monto_moneda_base;
                        monto_original = monto_moneda_base * exchangeRate.rate;
                    } else if (data.monto_original !== undefined) {
                        // User entered amount in account currency
                        monto_original = data.monto_original;
                        monto_moneda_base = monto_original / exchangeRate.rate;
                    } else {
                        throw new AppError('Debe especificar un monto', 'MONTO_REQUERIDO', 400);
                    }

                    processedData = {
                        ...data,
                        moneda_id: cuentaMonedaId,
                        moneda_actual_id: negocio.moneda_id,
                        tipo_cambio: exchangeRate.rate,
                        monto_original,
                        monto_moneda_base,
                    };
                }
            } else {
                throw new AppError('Tipo de entidad no válido', 'ENTIDAD_TIPO_INVALID', 400);
            }

            // Actualizar saldos utilizando los casos de uso
            if (data.entidad_tipo === 'CAJA') {
                if (data.tipo_movimiento === 'INGRESO') {
                    await this.acreditarCaja.execute(data.entidad_id, negocio_id, sucursal_id, processedData.monto_moneda_base!);
                } else if (data.tipo_movimiento === 'EGRESO') {
                    await this.debitarCaja.execute(data.entidad_id, negocio_id, sucursal_id, processedData.monto_moneda_base!);
                }
            } else if (data.entidad_tipo === 'CUENTA') {
                if (data.tipo_movimiento === 'INGRESO') {
                    await this.acreditarCuenta.execute(data.entidad_id, negocio_id, processedData.monto_original);
                } else if (data.tipo_movimiento === 'EGRESO') {
                    await this.debitarCuenta.execute(data.entidad_id, negocio_id, processedData.monto_original);
                }
            }

            return await this.transaccionRepository.crearIngresoEgreso(
                processedData,
                negocio_id,
                sucursal_id,
                usuario_id
            );
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
