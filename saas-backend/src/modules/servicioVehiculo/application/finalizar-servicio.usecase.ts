import { DatabaseError } from "../../../shared/database/errors/DatabaseError.js";
import AppError from "../../../shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioDetalle } from "../domain/servicio.entity.js";
import { ESTADO_SERVICIO } from "../domain/servicio.constants.js";
import type { TransactionManager } from "../../../shared/database/TransactionManager.js";
import type { SucursalRepository } from "../../sucursal/domain/sucursal.repository.js";
import type { AcreditarCajaUseCase } from "../../transaccion/application/acreditar-caja.usecase.js";
import type { AcreditarCuentaBancariaUseCase } from "../../transaccion/application/acreditar-cuenta-bancaria.usecase.js";
import type { CrearTransaccionUseCase } from "../../transaccion/application/crear-transaccion.usecase.js";
import type { ExchangeRateProvider } from "../../../shared/domain/providers/ExchangeRateProvider.js";
import { PrismaErrorMapper } from "../../../shared/database/prisma/PrismaErrorMapper.js";
import type { CrearMediaUseCase } from "../../media/application/crear-media.usecase.js";
import type { FileDTO } from "../../../shared/domain/providers/storage.provider.js";

export class FinalizarServicioUseCase {
    constructor(
        private readonly repository: ServicioRepository,
        private readonly transactionManager: TransactionManager,
        private readonly sucursalRepository: SucursalRepository,
        private readonly acreditarCajaUseCase: AcreditarCajaUseCase,
        private readonly acreditarCuentaBancariaUseCase: AcreditarCuentaBancariaUseCase,
        private readonly crearTransaccionUseCase: CrearTransaccionUseCase,
        private readonly exchangeRateProvider: ExchangeRateProvider,
        private readonly crearMediaUseCase: CrearMediaUseCase
    ) { }

    async execute(
        id: string,
        negocio_id: string,
        sucursal_id: string,
        usuario_id: string,
        files: FileDTO[],
        metodoPago: string,
        efectivoRecibido?: number | null,
        vuelto?: number | null,
        opcionesFinancieras?: {
            caja_id?: string;
            token_autorizado?: string;
            forzar_caja_en_linea?: boolean;
            cuenta_bancaria_id?: string;
        }
    ): Promise<ServicioDetalle> {
        try {

            const servicio = await this.repository.obtener(id, negocio_id);
            if (!servicio) throw new AppError('Servicio no encontrado', 'NOT_FOUND', 404);

            const estadosPermitidos = [ESTADO_SERVICIO.LISTO_ENTREGA, ESTADO_SERVICIO.EN_REPARACION, ESTADO_SERVICIO.EN_CUSTODIA];
            if (!estadosPermitidos.includes(servicio.estado as any)) {
                throw new AppError('El servicio no está en un estado válido para dar salida', 'INVALID_STATE', 400);
            }

            if (!files || files.length === 0) {
                throw new AppError('Las firmas son requeridas', 'FIRMA_REQUERIDA', 400);
            }

            const firmaClienteFile = files.find(f => (f as any).fieldname === 'firma_cliente');
            if (!firmaClienteFile && !servicio.firma_salida) {
                throw new AppError('La firma del cliente es requerida', 'FIRMA_REQUERIDA', 400);
            }

            if (!metodoPago) {
                throw new AppError('El método de pago es requerido', 'METODO_PAGO_REQUERIDO', 400);
            }

            const subtotal = Number(servicio.subtotal ?? 0);
            const totalRepuestos = (servicio.repuestos_inventario || []).reduce((acc: number, rep: any) => {
                return acc + (Number(rep.precio_venta) * Number(rep.cantidad));
            }, 0);
            const totalReparaciones = (servicio.servicioReparacion || []).reduce((acc: number, rep: any) => {
                const totalRep = (rep.servicioRepuestos || []).reduce((acc2: number, r: any) => {
                    return acc2 + (Number(r.precio_venta) * Number(r.cantidad));
                }, 0);
                return acc + (Number(rep.total) || 0) + totalRep;
            }, 0);
            const totalCustodias = (servicio.servicioCustodias || []).reduce((acc: number, rep: any) => {
                return acc + (Number(rep.total) || 0);
            }, 0);
            const totalCobro = subtotal + totalRepuestos + totalReparaciones + totalCustodias;

            if (metodoPago === 'EFECTIVO') {
                const recibido = Number(efectivoRecibido ?? 0);
                const cambio = Number(vuelto ?? 0);

                if (efectivoRecibido == null) {
                    throw new AppError('El efectivo recibido es requerido para pagos en efectivo', 'EFECTIVO_RECIBIDO_REQUERIDO', 400);
                }

                if (vuelto == null) {
                    throw new AppError('El vuelto es requerido para pagos en efectivo', 'VUELTO_REQUERIDO', 400);
                }

                if (!Number.isFinite(recibido) || recibido < totalCobro) {
                    throw new AppError('El efectivo recibido es menor al total del servicio', 'PAGO_INSUFICIENTE', 400);
                }

                if (!Number.isFinite(cambio) || cambio < 0) {
                    throw new AppError('El vuelto debe ser un número válido mayor o igual a cero', 'VUELTO_INVALIDO', 400);
                }
            }

            const path = `tenant_${negocio_id}/services/vehiculo/srv_${id}`;
            let firmaSalidaUrl = servicio.firma_salida;
            if (firmaClienteFile) {
                firmaSalidaUrl = await this.crearMediaUseCase.execute(firmaClienteFile, negocio_id, path, 'firma_salida.png');
            }

            // Subir firmas de reparaciones fuera de la transacción
            const uploadedRepairSignatures: Record<string, string> = {};
            const repairSignatureFiles = files.filter(f => (f as any).fieldname && (f as any).fieldname.startsWith('firma_reparacion_'));
            for (const file of repairSignatureFiles) {
                const reparacion_id = (file as any).fieldname.replace('firma_reparacion_', '');
                const repPath = `tenant_${negocio_id}/services/vehiculo/srv_${id}/reparaciones/${reparacion_id}`;
                const repairFirmaUrl = await this.crearMediaUseCase.execute(file, negocio_id, repPath, 'firma_salida.png');
                uploadedRepairSignatures[reparacion_id] = repairFirmaUrl;
            }

            // Subir firmas de custodia fuera de la transacción
            const uploadedCustodySignatures: Record<string, string> = {};
            const custodySignatureFiles = files.filter(f => (f as any).fieldname && (f as any).fieldname.startsWith('firma_custodia_'));
            for (const file of custodySignatureFiles) {
                const custodia_id = (file as any).fieldname.replace('firma_custodia_', '');
                const custPath = `tenant_${negocio_id}/services/vehiculo/srv_${id}/custodias/${custodia_id}`;
                const custFirmaUrl = await this.crearMediaUseCase.execute(file, negocio_id, custPath, 'firma_salida.png');
                uploadedCustodySignatures[custodia_id] = custFirmaUrl;
            }

            return await this.transactionManager.run(async (tx) => {
                const updatedServicio = await this.repository.actualizar(id, negocio_id, {
                    estado: ESTADO_SERVICIO.FINALIZADO,
                    firma_salida: firmaSalidaUrl ?? null,
                    MetodoPago: metodoPago as any,
                    efectivo_recibido: metodoPago === 'EFECTIVO' ? Number(efectivoRecibido) : null,
                    vuelto: metodoPago === 'EFECTIVO' ? Number(vuelto) : null,
                    fecha_salida: new Date(),
                    total: totalCobro
                }, { tx });

                // Procesar firmas de reparaciones
                const reparaciones = await tx.servicioReparacion.findMany({ where: { servicio_id: id } });
                for (const rep of reparaciones) {
                    let firma_url = rep.firma_salida;
                    if (uploadedRepairSignatures[rep.id]) {
                        firma_url = uploadedRepairSignatures[rep.id];
                    }

                    if (!firma_url) continue;

                    await tx.servicioReparacion.update({
                        where: { id: rep.id },
                        data: {
                            firma_salida: firma_url,
                            fecha_salida: new Date()
                        }
                    });
                }

                // Procesar firmas de custodias
                const custodias = await tx.servicioCustodia.findMany({ where: { servicio_id: id } });
                for (const cust of custodias) {
                    let firma_url = cust.firma_salida;
                    if (uploadedCustodySignatures[cust.id]) {
                        firma_url = uploadedCustodySignatures[cust.id];
                    }

                    if (!firma_url) continue;

                    await tx.servicioCustodia.update({
                        where: { id: cust.id },
                        data: {
                            firma_salida: firma_url,
                            fecha_salida: cust.fecha_salida ?? new Date()
                        }
                    });
                }

                const negocioInfo = await tx.negocio.findUnique({ where: { id: negocio_id } });
                const moneda_id = negocioInfo?.moneda_id;
                if (!moneda_id) {
                    throw new AppError('El negocio no tiene una moneda configurada.', 'MONEDA_NO_CONFIGURADA', 400);
                }

                if (metodoPago === 'EFECTIVO') {
                    const sucursal = await this.sucursalRepository.obtenerMiSucursal(negocio_id, sucursal_id);
                    if (!sucursal || !sucursal.cajas || sucursal.cajas.length === 0) {
                        throw new AppError('La sucursal no tiene cajas configuradas.', 'CAJAS_NO_CONFIGURADAS', 400);
                    }

                    let cajaSeleccionada = null;

                    if (!opcionesFinancieras?.forzar_caja_en_linea && opcionesFinancieras?.caja_id) {
                        const cajaFisica = sucursal.cajas.find(c => c.id === opcionesFinancieras.caja_id && c.tipo === 'FISICA');
                        if (!cajaFisica) {
                            throw new AppError('La caja física indicada no existe.', 'CAJA_FISICA_NO_ENCONTRADA', 404);
                        }
                        if (cajaFisica.token_autorizado !== opcionesFinancieras.token_autorizado) {
                            throw new AppError('El token no coincide con la caja física', 'CAJA_TOKEN_MISMATCH', 400);
                        }
                        cajaSeleccionada = cajaFisica;
                    }

                    if (!cajaSeleccionada) {
                        cajaSeleccionada = sucursal.cajas.find(c => c.tipo === 'EN_LINEA');
                        if (!cajaSeleccionada) {
                            throw new AppError('No hay una caja en línea disponible para asignar los fondos.', 'CAJA_EN_LINEA_NO_ENCONTRADA', 404);
                        }
                    }

                    await this.acreditarCajaUseCase.execute(cajaSeleccionada.id, negocio_id, sucursal_id, totalCobro, { tx: tx as any });

                    const idCorto = servicio.id.slice(-6).toUpperCase();
                    await this.crearTransaccionUseCase.execute({
                        negocio_id: negocio_id,
                        sucursal_id: sucursal_id,
                        usuario_id: usuario_id,
                        tipo_movimiento: 'INGRESO',
                        origen_tipo: 'SERVICIO',
                        origen_id: servicio.id,
                        moneda_id: moneda_id,
                        monto_original: totalCobro,
                        tipo_cambio: 1.0,
                        monto_moneda_base: totalCobro,
                        descripcion: `Cobro de servicio por ${totalCobro} - ${idCorto}`,
                        destino_entidad: 'CAJA',
                        destino_caja_id: cajaSeleccionada.id,
                        metodo_pago: 'EFECTIVO',
                        fecha_transaccion: new Date()
                    } as any, { tx: tx as any });

                } else if (metodoPago === 'TARJETA' || metodoPago === 'TRANSFERENCIA') {
                    let idCuenta: string;
                    if (!opcionesFinancieras?.cuenta_bancaria_id) {
                        const sucursalDB = await this.sucursalRepository.obtenerMiSucursal(negocio_id, sucursal_id);
                        const relacionCuenta = sucursalDB?.cuentas_bancarias?.find(c => c.metodo_pago === metodoPago);
                        const cuentaIdAsociada = relacionCuenta?.cuenta_bancaria?.id;
                        if (!cuentaIdAsociada) {
                            throw new AppError('No se especificó una cuenta bancaria y la sucursal no tiene ninguna configurada.', 'CUENTA_BANCARIA_NO_ESPECIFICADA', 400);
                        }
                        idCuenta = cuentaIdAsociada;
                    } else {
                        idCuenta = opcionesFinancieras.cuenta_bancaria_id;
                    }

                    const cuentaDB = await tx.cuentaBancaria.findUnique({ where: { id: idCuenta } });
                    if (!cuentaDB) {
                        throw new AppError('La cuenta bancaria indicada no existe.', 'CUENTA_BANCARIA_NO_ENCONTRADA', 404);
                    }

                    let tasaCambioUsada = 1;
                    let montoOriginalConvertido = totalCobro;
                    
                    if (cuentaDB.moneda_id !== moneda_id) {
                        const monedaNegocio = await tx.moneda.findUnique({ where: { id: moneda_id } });
                        const monedaCuenta = await tx.moneda.findUnique({ where: { id: cuentaDB.moneda_id } });
                        if (!monedaNegocio || !monedaCuenta) throw new AppError('Moneda no encontrada', 'MONEDA_NOT_FOUND', 404);
                        
                        tasaCambioUsada = (await this.exchangeRateProvider.getRate(monedaNegocio.codigo, monedaCuenta.codigo)).rate;
                        montoOriginalConvertido = totalCobro * tasaCambioUsada;
                    }

                    await this.acreditarCuentaBancariaUseCase.execute(idCuenta, negocio_id, montoOriginalConvertido, totalCobro, { tx: tx as any });

                    const idCorto = servicio.id.slice(-6).toUpperCase();
                    await this.crearTransaccionUseCase.execute({
                        negocio_id: negocio_id,
                        sucursal_id: sucursal_id,
                        usuario_id: usuario_id,
                        tipo_movimiento: 'INGRESO',
                        origen_tipo: 'SERVICIO',
                        origen_id: servicio.id,
                        moneda_id: cuentaDB.moneda_id,
                        monto_original: montoOriginalConvertido,
                        tipo_cambio: tasaCambioUsada,
                        monto_moneda_base: totalCobro,
                        descripcion: `Cobro de servicio por ${totalCobro} (${metodoPago}) - ${idCorto}`,
                        destino_entidad: 'CUENTA',
                        destino_cuenta_id: idCuenta,
                        metodo_pago: metodoPago,
                        fecha_transaccion: new Date()
                    } as any, { tx: tx as any });
                }

                return updatedServicio;
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
