import AppError from '../../../shared/errors/AppError.js';
import { PrismaErrorMapper } from '../../../shared/database/prisma/PrismaErrorMapper.js';
import type { HashProvider } from '../../../shared/domain/hash.provider.js';

export class FinalizarPreVentaUseCase {
    constructor(
        private readonly db: any,
        private readonly hashProvider?: HashProvider
    ) {}

    async execute(id: string, negocio_id: string, sucursal_id: string, usuario_id: string, payload: any, permisos: string[] = []) {
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
