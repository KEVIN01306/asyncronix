import AppError from '../../../shared/errors/AppError.js';
import { PrismaErrorMapper } from '../../../shared/database/prisma/PrismaErrorMapper.js';
import type { HashProvider } from '../../../shared/domain/hash.provider.js';
import type { SucursalRepository } from '../../sucursal/domain/sucursal.repository.js';
import type { AcreditarCajaUseCase } from '../../transaccion/application/acreditar-caja.usecase.js';
import type { AcreditarCuentaBancariaUseCase } from '../../transaccion/application/acreditar-cuenta-bancaria.usecase.js';
import type { CrearTransaccionUseCase } from '../../transaccion/application/crear-transaccion.usecase.js';
import type { ExchangeRateProvider } from '../../../shared/domain/providers/ExchangeRateProvider.js';

export class FinalizarPreVentaUseCase {
    constructor(
        private readonly db: any,
        private readonly hashProvider: HashProvider | undefined,
        private readonly sucursalRepository: SucursalRepository,
        private readonly acreditarCajaUseCase: AcreditarCajaUseCase,
        private readonly acreditarCuentaBancariaUseCase: AcreditarCuentaBancariaUseCase,
        private readonly crearTransaccionUseCase: CrearTransaccionUseCase,
        private readonly exchangeRateProvider: ExchangeRateProvider
    ) {}

    async execute(id: string, negocio_id: string, sucursal_id: string, usuario_id: string, payload: any, permisos: string[] = [], opcionesCaja?: { caja_id?: string; token_autorizado?: string; forzar_caja_en_linea?: boolean }) {
        try {
            const preventa = await this.db.preVenta.findFirst({
                where: { id, negocio_id, sucursal_id, usuario_id, activo: true },
                include: { detalles: true }
            });

            if (!preventa) throw new Error('PREVENTA_NO_ENCONTRADA');

            const total = preventa.detalles.reduce((acc: number, detalle: any) => acc + Number(detalle.precio) * detalle.cantidad, 0);
            const puedeForzarStock = permisos.includes('VENTAS_FORZAR_STOCK');
            const overrideStock = Boolean(payload?.override_stock);
            const pinCaja = payload?.pin_caja;

            this.validarPago(payload, total);

            if (overrideStock && !puedeForzarStock) {
                throw new AppError('No tienes permiso para forzar stock', 'FORBIDDEN', 403);
            }

            if (overrideStock) {
                await this.validarPinParaForzarStock(pinCaja, negocio_id, sucursal_id);
            }

            const faltantes = await this.validarStock(preventa.detalles, negocio_id, sucursal_id);
            if (faltantes.length > 0 && !overrideStock) {
                return {
                    faltantes,
                    requiere_forzar_stock: true,
                    total,
                    message: 'Stock insuficiente para completar la venta',
                    preventa_id: id
                };
            }

            return await this.db.$transaction(async (tx: any) => {
                const venta = await tx.venta.create({
                    data: {
                        negocio_id,
                        sucursal_id,
                        usuario_id,
                        cliente_id: preventa.cliente_id ?? null,
                        estado: 'COMPLETADA',
                        metodo_pago: payload?.metodo_pago ?? 'EFECTIVO',
                        total,
                        total_costo: 0,
                        comentarios: payload?.comentarios ?? null,
                        efectivo_recibido: payload?.efectivo_recibido ?? null,
                        vuelto: payload?.vuelto ?? null,
                    }
                });

                const negocioInfo = await tx.negocio.findUnique({ where: { id: negocio_id } });
                const moneda_id = negocioInfo?.moneda_id;
                if (!moneda_id) {
                    throw new AppError('El negocio no tiene una moneda configurada.', 'MONEDA_NO_CONFIGURADA', 400);
                }

                // Lógica financiera
                const metodoPagoReal = venta.metodo_pago;

                if (metodoPagoReal === 'EFECTIVO') {
                    const sucursal = await this.sucursalRepository.obtenerMiSucursal(negocio_id, sucursal_id);
                    if (!sucursal || !sucursal.cajas || sucursal.cajas.length === 0) {
                        throw new AppError('La sucursal no tiene cajas configuradas.', 'CAJAS_NO_CONFIGURADAS', 400);
                    }

                    let cajaSeleccionada = null;

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

                    if (!cajaSeleccionada) {
                        cajaSeleccionada = sucursal.cajas.find(c => c.tipo === 'EN_LINEA');
                        if (!cajaSeleccionada) {
                            throw new AppError('No hay caja en línea configurada para esta sucursal', 'CAJA_EN_LINEA_NO_CONFIGURADA', 400);
                        }
                    }

                    await this.acreditarCajaUseCase.execute(cajaSeleccionada.id, negocio_id, sucursal_id, venta.total, { tx });

                    await this.crearTransaccionUseCase.execute({
                        negocio_id, sucursal_id, usuario_id,
                        tipo_movimiento: 'INGRESO', origen_tipo: 'VENTA',
                        moneda_id,
                        monto_original: venta.total, tipo_cambio: 1.0, monto_moneda_base: venta.total,
                        metodo_pago: 'EFECTIVO',
                        descripcion: `Venta de ${venta.total} - ${venta.id.slice(-4)}`,
                        destino_entidad: 'CAJA', destino_caja_id: cajaSeleccionada.id,
                        fecha_transaccion: new Date()
                    } as any, { tx });
                } else if (metodoPagoReal === 'TARJETA' || metodoPagoReal === 'TRANSFERENCIA') {
                    const sucursal = await this.sucursalRepository.obtenerMiSucursal(negocio_id, sucursal_id);
                    if (!sucursal) throw new AppError('Sucursal no encontrada.', 'SUCURSAL_NO_ENCONTRADA', 404);
                    
                    const relacionCuenta = sucursal.cuentas_bancarias.find(c => c.metodo_pago === metodoPagoReal);
                    if (!relacionCuenta) throw new AppError(`La sucursal no tiene una cuenta bancaria configurada para el método de pago ${metodoPagoReal}.`, 'CUENTA_NO_CONFIGURADA', 400);
                    
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

                    await this.acreditarCuentaBancariaUseCase.execute(relacionCuenta.cuenta_bancaria.id, negocio_id, finalMontoOriginal, { tx });

                    await this.crearTransaccionUseCase.execute({
                        negocio_id, sucursal_id, usuario_id,
                        tipo_movimiento: 'INGRESO', origen_tipo: 'VENTA',
                        moneda_id: finalMonedaId,
                        monto_original: finalMontoOriginal, tipo_cambio: finalTipoCambio, monto_moneda_base: venta.total,
                        metodo_pago: metodoPagoReal,
                        descripcion: `Venta de ${venta.total} - ${venta.id.slice(-4)}`,
                        destino_entidad: 'CUENTA', destino_cuenta_id: relacionCuenta.cuenta_bancaria.id,
                        fecha_transaccion: new Date()
                    } as any, { tx });
                }

                let proveedor: any = null;
                if (overrideStock) {
                    proveedor = await tx.proveedor.findFirst({ where: { negocio_id, activo: true } });
                    if (!proveedor) throw new AppError('No existe un proveedor activo para regularizar el stock', 'PROVEEDOR_NO_ENCONTRADO', 400);
                }

                for (const detalle of preventa.detalles) {
                    const cantidadSolicitada = Number(detalle.cantidad ?? 0);
                    const varianteId = detalle.variante_id;
                    let restante = cantidadSolicitada;
                    const detallesVenta: any[] = [];

                    const lotesDisponibles = await tx.lote.findMany({
                        where: {
                            negocio_id,
                            sucursal_id,
                            variante_id: varianteId,
                            activo: true,
                            cantidad_actual: { gt: 0 }
                        },
                        orderBy: { fecha_ingreso: 'asc' }
                    });

                    for (const lote of lotesDisponibles) {
                        if (restante <= 0) break;

                        const disponible = Number(lote.cantidad_actual ?? 0);
                        if (disponible <= 0) continue;

                        const tomar = Math.min(restante, disponible);
                        detallesVenta.push({
                            lote_id: lote.id,
                            cantidad: tomar,
                            precio_unitario: Number(detalle.precio),
                            costo_unitario: Number(lote.costo_compra ?? 0)
                        });
                        restante -= tomar;
                    }

                    if (restante > 0) {
                        const sysLote = await tx.lote.findFirst({
                            where: { negocio_id, sucursal_id, variante_id: varianteId, codigo_lote: 'SYS_LOTE_NEGATIVO' }
                        }) ?? (await tx.lote.create({
                            data: {
                                negocio_id,
                                sucursal_id,
                                variante_id: varianteId,
                                proveedor_id: proveedor.id,
                                codigo_lote: 'SYS_LOTE_NEGATIVO',
                                cantidad_inicial: 0,
                                cantidad_actual: 0,
                                costo_compra: 0,
                                precio_venta: Number(detalle.precio),
                                activo: true
                            }
                        }));

                        const stockDisponible = Number(sysLote.cantidad_actual ?? 0);
                        const stockParaFallback = Math.max(stockDisponible, restante);
                    

                        detallesVenta.push({
                            lote_id: sysLote.id ?? sysLote,
                            cantidad: restante,
                            precio_unitario: Number(detalle.precio),
                            costo_unitario: 0
                        });
                    }

                    for (const detalleVenta of detallesVenta) {
                        await tx.ventaDetalle.create({
                            data: {
                                venta_id: venta.id,
                                variante_id: detalle.variante_id,
                                descripcion: detalle.descripcion,
                                cantidad: detalleVenta.cantidad,
                                precio_unitario: Number(detalleVenta.precio_unitario),
                                costo_unitario: Number(detalleVenta.costo_unitario),
                                lote_id: detalleVenta.lote_id,
                            }
                        });
                    }
                }

                await tx.preVentaDetalle.deleteMany({ where: { pre_venta_id: id } });
                await tx.preVenta.update({ where: { id }, data: { activo: false } });

                return { venta, preventa };
            },{
                maxWait: 5000,
                timeout: 15000
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    private validarPago(payload: any, total: number) {
        if ((payload?.metodo_pago ?? 'EFECTIVO') !== 'EFECTIVO') return;

        const recibido = Number(payload?.efectivo_recibido ?? 0);
        if (!Number.isFinite(recibido) || recibido < total) {
            throw new AppError('El efectivo recibido es menor al total de la venta', 'PAGO_INSUFICIENTE', 400);
        }
    }

    private async validarPinParaForzarStock(pinCaja: string | null | undefined, negocio_id: string, sucursal_id: string) {
        if (!pinCaja) {
            throw new AppError('Debe proporcionar el PIN de caja para forzar stock', 'PIN_REQUERIDO', 400);
        }

        if (!this.hashProvider) {
            throw new AppError('No está disponible el verificador de PIN de caja', 'PIN_NO_DISPONIBLE', 500);
        }

        const usuarios = await this.db.usuario.findMany({
            where: { negocio_id, sucursal_id, activo: true },
            include: { roles: { include: { permisos: true } } }
        });

        for (const usuario of usuarios) {
            if (!usuario?.pin_caja) continue;
            const coincide = await this.hashProvider.compare(String(pinCaja), usuario.pin_caja);
            if (!coincide) continue;

            const permisos = (usuario.roles ?? []).flatMap((rol: any) => (rol.permisos ?? []).map((permiso: any) => permiso.codigo));
            if (!permisos.includes('VENTAS_FORZAR_STOCK')) {
                throw new AppError('El usuario no posee permiso para forzar stock', 'FORBIDDEN', 403);
            }

            return usuario;
        }

        throw new AppError('PIN inválido o sin permiso para forzar stock', 'PIN_INVALIDO', 400);
    }

    private async validarStock(detalles: any[], negocio_id: string, sucursal_id: string) {
        const faltantes: any[] = [];

        for (const detalle of detalles) {
            const varianteId = detalle.variante_id;
            const cantidadSolicitada = Number(detalle.cantidad ?? 0);
            const lotes = await this.db.lote.findMany({
                where: { negocio_id, sucursal_id, variante_id: varianteId, activo: true }
            });

            const disponibleTotal = lotes.reduce((acumulado: number, lote: any) => acumulado + Number(lote.cantidad_actual ?? 0), 0);
            if (disponibleTotal < cantidadSolicitada) {
                faltantes.push({
                    variante_id: varianteId,
                    descripcion: detalle.descripcion,
                    solicitado: cantidadSolicitada,
                    disponible: disponibleTotal
                });
            }
        }

        return faltantes;
    }
}
