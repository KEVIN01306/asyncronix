import AppError from "../../../shared/errors/AppError.js";
import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import { PersistenceError } from '../../../shared/database/errors/PersistenceError.js';
import { VentaNotFoundPersistenceError } from '../../../shared/database/errors/VentaNotFoundPersistenceError.js';
import type { VentaRepository } from "../domain/venta.repository.js";
import type { TransactionManager } from "../../../shared/database/TransactionManager.js";
import type { SucursalRepository } from "../../sucursal/domain/sucursal.repository.js";
import type { AcreditarCajaUseCase } from "../../transaccion/application/acreditar-caja.usecase.js";
import type { AcreditarCuentaBancariaUseCase } from "../../transaccion/application/acreditar-cuenta-bancaria.usecase.js";
import type { CrearTransaccionUseCase } from "../../transaccion/application/crear-transaccion.usecase.js";
import type { ExchangeRateProvider } from "../../../shared/domain/providers/ExchangeRateProvider.js";
import type { VentaSimple, MetodoPago } from "../domain/venta.entity.js";

export class FinalizarVentaUseCase {
    constructor(
        private readonly ventaRepository: VentaRepository,
        private readonly transactionManager: TransactionManager,
        private readonly sucursalRepository: SucursalRepository,
        private readonly acreditarCajaUseCase: AcreditarCajaUseCase,
        private readonly acreditarCuentaBancariaUseCase: AcreditarCuentaBancariaUseCase,
        private readonly crearTransaccionUseCase: CrearTransaccionUseCase,
        private readonly exchangeRateProvider: ExchangeRateProvider
    ) {}

    async execute(
        ventaId: string, 
        negocio_id: string, 
        sucursal_id: string, 
        usuario_id: string, 
        metodo_pago?: MetodoPago,
        opcionesCaja?: { caja_id?: string; token_autorizado?: string; forzar_caja_en_linea?: boolean }
    ): Promise<VentaSimple> {
        try {
            return await this.transactionManager.run(async (tx) => {
                // 1. Finalizar la venta y obtenerla
                const venta = await this.ventaRepository.finalizarVenta(ventaId, negocio_id, sucursal_id, metodo_pago, { tx });
                const metodoPagoReal = venta.metodo_pago;

                const negocioInfo = await tx.negocio.findUnique({ where: { id: negocio_id } });
                const moneda_id = negocioInfo?.moneda_id;
                if (!moneda_id) {
                    throw new AppError('El negocio no tiene una moneda configurada.', 'MONEDA_NO_CONFIGURADA', 400);
                }

                // 2. Ejecutar lógica financiera según método de pago
                if (metodoPagoReal === 'EFECTIVO') {
                    // Obtener la sucursal con sus cajas
                    const sucursal = await this.sucursalRepository.obtenerMiSucursal(negocio_id, sucursal_id);
                    if (!sucursal || !sucursal.cajas || sucursal.cajas.length === 0) {
                        throw new AppError('La sucursal no tiene cajas configuradas.', 'CAJAS_NO_CONFIGURADAS', 400);
                    }

                    let cajaSeleccionada = null;

                    // Si NO se fuerza la caja en línea, intentamos usar la caja física indicada
                    if (!opcionesCaja?.forzar_caja_en_linea && opcionesCaja?.caja_id) {
                        const cajaFisica = sucursal.cajas.find(c => c.id === opcionesCaja.caja_id && c.tipo === 'FISICA');
                        if (!cajaFisica) {
                            throw new AppError('La caja física indicada no existe.', 'CAJA_FISICA_NO_ENCONTRADA', 404);
                        }

                        if (cajaFisica.token_autorizado !== opcionesCaja.token_autorizado) {
                            throw new AppError('El token no coincide con la caja física', 'CAJA_TOKEN_MISMATCH', 400);
                        }

                        cajaSeleccionada = cajaFisica;
                    }

                    // Si no se seleccionó caja física (porque se forzó en línea o no se envió id de caja física), usamos la EN_LINEA
                    if (!cajaSeleccionada) {
                        cajaSeleccionada = sucursal.cajas.find(c => c.tipo === 'EN_LINEA');
                        if (!cajaSeleccionada) {
                            throw new AppError('No hay caja en línea configurada para esta sucursal', 'CAJA_EN_LINEA_NO_CONFIGURADA', 400);
                        }
                    }
                    
                    await this.acreditarCajaUseCase.execute(cajaSeleccionada.id, negocio_id, sucursal_id, venta.total, { tx });

                    await this.crearTransaccionUseCase.execute({
                        negocio_id,
                        sucursal_id,
                        usuario_id,
                        tipo_movimiento: 'INGRESO',
                        origen_tipo: 'VENTA',
                        moneda_id,
                        monto_original: venta.total,
                        tipo_cambio: 1.0,
                        monto_moneda_base: venta.total,
                        descripcion: `Venta de ${venta.total} - ${venta.id.slice(-4)}`,
                        destino_entidad: 'CAJA',
                        destino_caja_id: cajaSeleccionada.id,
                        metodo_pago: 'EFECTIVO',
                        fecha_transaccion: new Date()
                    } as any, { tx });

                } else if (metodoPagoReal === 'TARJETA' || metodoPagoReal === 'TRANSFERENCIA') {
                    const sucursal = await this.sucursalRepository.obtenerMiSucursal(negocio_id, sucursal_id);
                    if (!sucursal) {
                        throw new AppError('Sucursal no encontrada.', 'SUCURSAL_NO_ENCONTRADA', 404);
                    }
                    
                    const relacionCuenta = sucursal.cuentas_bancarias.find(c => c.metodo_pago === metodoPagoReal);
                    if (!relacionCuenta) {
                        throw new AppError(`La sucursal no tiene una cuenta bancaria configurada para el método de pago ${metodoPagoReal}.`, 'CUENTA_NO_CONFIGURADA', 400);
                    }
                    
                    const cuentaMonedaId = relacionCuenta.cuenta_bancaria.moneda_id;
                    let finalTipoCambio = 1.0;
                    let finalMontoOriginal = venta.total;
                    let finalMonedaId = moneda_id;

                    if (cuentaMonedaId && cuentaMonedaId !== moneda_id) {
                        const monedaNegocio = await tx.moneda.findUnique({ where: { id: moneda_id } });
                        const monedaCuenta = await tx.moneda.findUnique({ where: { id: cuentaMonedaId } });
                        if (!monedaNegocio || !monedaCuenta) {
                            throw new AppError('No se encontraron las monedas para el tipo de cambio.', 'MONEDA_NO_ENCONTRADA', 400);
                        }
                        
                        const exchangeRate = await this.exchangeRateProvider.getRate(monedaNegocio.codigo, monedaCuenta.codigo);
                        finalTipoCambio = exchangeRate.rate;
                        finalMontoOriginal = venta.total * finalTipoCambio;
                        finalMonedaId = cuentaMonedaId;
                    }

                    await this.acreditarCuentaBancariaUseCase.execute(relacionCuenta.cuenta_bancaria.id, negocio_id, finalMontoOriginal, data.total, { tx });

                    await this.crearTransaccionUseCase.execute({
                        negocio_id,
                        sucursal_id,
                        usuario_id,
                        tipo_movimiento: 'INGRESO',
                        origen_tipo: 'VENTA',
                        moneda_id: finalMonedaId,
                        monto_original: finalMontoOriginal,
                        tipo_cambio: finalTipoCambio,
                        monto_moneda_base: venta.total,
                        descripcion: `Venta de ${venta.total} - ${venta.id.slice(-4)}`,
                        destino_entidad: 'CUENTA',
                        destino_cuenta_id: relacionCuenta.cuenta_bancaria.id,
                        metodo_pago: metodoPagoReal,
                        fecha_transaccion: new Date()
                    } as any, { tx });
                }

                return venta;
            });
        } catch (error: any) {
            if (error instanceof PersistenceError) {
                if (error instanceof VentaNotFoundPersistenceError) throw new AppError('La venta no existe', 'NOT_FOUND', 404);
                throw new AppError(error.message || 'Error de persistencia', 'PERSISTENCE_ERROR', 500);
            }
            if (error.message === 'VENTA_NO_PENDIENTE') {
                throw new AppError('Solo se puede finalizar una venta en estado PENDIENTE', 'BAD_REQUEST', 400);
            }
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof DatabaseError) throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}

