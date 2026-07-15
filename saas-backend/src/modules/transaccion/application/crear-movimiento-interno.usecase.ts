import AppError from '@shared/errors/AppError.js';
import { DatabaseError } from '@shared/database/errors/DatabaseError.js';
import type { MovimientoInternoCrear, MovimientoInternoEntity } from '../domain/transaccion.entity.js';
import type { TransaccionRepository } from '../domain/transaccion.repository.js';
import type { ExchangeRateProvider } from '@shared/domain/providers/ExchangeRateProvider.js';
import type { AcreditarCajaUseCase } from './acreditar-caja.usecase.js';
import type { DebitarCajaUseCase } from './debitar-caja.usecase.js';
import type { AcreditarCuentaBancariaUseCase } from './acreditar-cuenta-bancaria.usecase.js';
import type { DebitarCuentaBancariaUseCase } from './debitar-cuenta-bancaria.usecase.js';

interface CajaData {
    id: string;
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

export class CrearMovimientoInternoUseCase {
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
        data: Omit<MovimientoInternoCrear, 'tipo_cambio' | 'monto_moneda_base' | 'moneda_actual_id' | 'moneda_id'>,
        negocio_id: string,
        sucursal_id: string,
        usuario_id: string
    ): Promise<MovimientoInternoEntity> {
        try {
            if (data.origen_entidad === data.destino_entidad && data.origen_id === data.destino_id) {
                throw new AppError('La entidad de origen y destino no pueden ser la misma', 'ENTIDAD_IGUAL', 400);
            }

            const negocio = await this.obtenerNegocio(negocio_id);
            if (!negocio) {
                throw new AppError('Negocio no encontrado', 'NEGOCIO_NOT_FOUND', 404);
            }

            const negocioMoneda = await this.obtenerMoneda(negocio.moneda_id);
            if (!negocioMoneda) {
                throw new AppError('Moneda del negocio no válida', 'MONEDA_INVALID', 400);
            }

            let monedaOrigenId = negocio.moneda_id;
            let monedaDestinoId = negocio.moneda_id;

            // Validar existencia de Entidad Origen
            if (data.origen_entidad === 'CAJA') {
                const caja = await this.obtenerCaja(data.origen_id);
                if (!caja) throw new AppError('Caja de origen no encontrada', 'CAJA_NOT_FOUND', 404);
            } else if (data.origen_entidad === 'CUENTA') {
                const cuenta = await this.obtenerCuenta(data.origen_id);
                if (!cuenta) throw new AppError('Cuenta bancaria de origen no encontrada', 'CUENTA_NOT_FOUND', 404);
                monedaOrigenId = cuenta.moneda_id || negocio.moneda_id;
            }

            // Validar existencia de Entidad Destino
            if (data.destino_entidad === 'CAJA') {
                const caja = await this.obtenerCaja(data.destino_id);
                if (!caja) throw new AppError('Caja de destino no encontrada', 'CAJA_NOT_FOUND', 404);
            } else if (data.destino_entidad === 'CUENTA') {
                const cuenta = await this.obtenerCuenta(data.destino_id);
                if (!cuenta) throw new AppError('Cuenta bancaria de destino no encontrada', 'CUENTA_NOT_FOUND', 404);
                monedaDestinoId = cuenta.moneda_id || negocio.moneda_id;
            }

            const monedaOrigen = await this.obtenerMoneda(monedaOrigenId);
            const monedaDestino = await this.obtenerMoneda(monedaDestinoId);
            if (!monedaOrigen || !monedaDestino) {
                throw new AppError('Monedas de entidades no válidas', 'MONEDA_INVALID', 400);
            }

            // El usuario ingresa el monto en la moneda de la Entidad Origen.
            let monto_original = data.monto_original;
            let monto_moneda_base = data.monto_original;
            let tipo_cambio = 1.0;

            if (monedaOrigenId !== negocio.moneda_id) {
                const exchangeRate = await this.exchangeRateProvider.getRate(negocioMoneda.codigo, monedaOrigen.codigo);
                tipo_cambio = exchangeRate.rate;
                monto_moneda_base = monto_original / exchangeRate.rate;
            }

            // Debitar de origen
            if (data.origen_entidad === 'CAJA') {
                await this.debitarCaja.execute(data.origen_id, negocio_id, sucursal_id, monto_moneda_base);
            } else {
                await this.debitarCuenta.execute(data.origen_id, negocio_id, monto_original, monto_moneda_base);
            }

            // Acreditar a destino (necesita conversión si la moneda de destino es distinta a la moneda base)
            let montoDestinoOriginal = monto_moneda_base;
            if (data.destino_entidad === 'CAJA') {
                await this.acreditarCaja.execute(data.destino_id, negocio_id, sucursal_id, monto_moneda_base);
            } else {
                if (monedaDestinoId !== negocio.moneda_id) {
                    const exchangeRateDest = await this.exchangeRateProvider.getRate(negocioMoneda.codigo, monedaDestino.codigo);
                    montoDestinoOriginal = monto_moneda_base * exchangeRateDest.rate;
                }
                await this.acreditarCuenta.execute(data.destino_id, negocio_id, montoDestinoOriginal, monto_moneda_base);
            }

            const payload: MovimientoInternoCrear = {
                ...data,
                moneda_id: monedaOrigenId,
                moneda_actual_id: negocio.moneda_id,
                tipo_cambio,
                monto_moneda_base
            };

            return await this.transaccionRepository.crearMovimientoInterno(
                payload,
                negocio_id,
                sucursal_id,
                usuario_id
            );
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
