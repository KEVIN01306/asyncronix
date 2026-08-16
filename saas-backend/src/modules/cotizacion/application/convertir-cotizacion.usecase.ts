import AppError from "@shared/errors/AppError.js";
import type { CotizacionRepository } from "../domain/cotizacion.repository.js";
import type { CotizacionSimple } from "../domain/cotizacion.entity.js";
import type { TransactionManager } from "@shared/database/TransactionManager.js";
import type { CrearPreVentaUseCase } from "../../ventas/application/crear-preventa.usecase.js";
import type { RegistrarServicioUseCase } from "../../servicioVehiculo/application/registrar-servicio.usecase.js";
import type { VarianteRepository } from "../../producto/domain/variante.repository.js";
import type { CrearServicioRepuestoUseCase } from "../../servicioVehiculo/application/crear-repuesto-servicio.usecase.js";

export class ConvertirCotizacionUseCase {
    constructor(
        private readonly cotizacionRepository: CotizacionRepository,
        private readonly transactionManager: TransactionManager,
        private readonly registrarVentaUseCase: any, // kept for signature compatibility if not removed entirely in module
        private readonly finalizarVentaUseCase: any, // kept for signature compatibility
        private readonly crearPreVentaUseCase: CrearPreVentaUseCase,
        private readonly registrarServicioUseCase: RegistrarServicioUseCase,
        private readonly varianteRepository: VarianteRepository,
        private readonly crearServicioRepuestoUseCase: CrearServicioRepuestoUseCase
    ) { }

    async execute(
        id: string,
        negocio_id: string,
        sucursal_id: string,
        usuario_id: string,
        metodo_pago?: any,
        opcionesCaja?: any,
        ignoreStock?: boolean,
        tipo_servicio_id_override?: string
    ): Promise<CotizacionSimple> {

        const cotizacion = await this.cotizacionRepository.obtener(id, negocio_id, sucursal_id);
        if (!cotizacion) {
            throw new AppError("Cotización no encontrada.", "NOT_FOUND", 404);
        }

        if (cotizacion.estado !== 'ACEPTADA') {
            throw new AppError("Solo se pueden convertir cotizaciones en estado ACEPTADA.", "INVALID_STATUS", 400);
        }

        if (cotizacion.venta_id || cotizacion.preventa_id || cotizacion.servicio_id) {
            throw new AppError("La cotización ya fue convertida anteriormente.", "ALREADY_CONVERTED", 400);
        }

        const resultado = await this.transactionManager.run(async (tx) => {
            if (cotizacion.tipo_destino === 'VENTA_DIRECTA') {
                const productos = cotizacion.detalles.filter(d => d.variante_id);

                if (productos.length === 0) {
                    throw new AppError("No hay productos válidos para crear la preventa.", "INVALID_OPERATION", 400);
                }

                if (!ignoreStock) {
                    const sinStock: string[] = [];
                    for (const prod of productos) {
                        const variante = await this.varianteRepository.obtener(prod.variante_id as string, negocio_id);
                        if (variante) {
                            const stockReal = variante.stock_total ?? 0;
                            if (stockReal < prod.cantidad) {
                                sinStock.push(variante.producto?.nombre ?? variante.sku ?? 'Desconocido');
                            }
                        }
                    }
                    if (sinStock.length > 0) {
                        throw new AppError(`Stock insuficiente para: ${sinStock.join(', ')}`, 'INSUFICIENTE_STOCK', 400);
                    }
                }

                const preventaData = {
                    cliente_id: cotizacion.cliente_id,
                    items: productos.map(p => ({
                        variante_id: p.variante_id,
                        cantidad: p.cantidad,
                        precio: p.precio_unitario,
                        descripcion: p.descripcion
                    }))
                };

                const preventa = await this.crearPreVentaUseCase.execute(preventaData, negocio_id, sucursal_id, usuario_id);

                await this.cotizacionRepository.marcarConvertida(cotizacion.id, 'VENTA_DIRECTA', preventa.id, negocio_id, sucursal_id, { tx });

            } else if (cotizacion.tipo_destino === 'TALLER') {

                if (!cotizacion.vehiculo_id) {
                    throw new AppError("La cotización requiere un vehículo asignado para convertirse a servicio.", "MISSING_VEHICULO", 400);
                }

                // Obtener el tipo de servicio (tomaremos el primero de los detalles o nulo)
                const detalleTipoServicio = cotizacion.detalles.find(d => d.tipo_servicio_id);
                const tipo_servicio_id = detalleTipoServicio?.tipo_servicio_id || tipo_servicio_id_override;

                if (!tipo_servicio_id) {
                    throw new AppError("Se requiere un tipo de servicio para convertir a Taller.", "MISSING_TIPO_SERVICIO", 400);
                }

                const repuestos = cotizacion.detalles.filter(d => d.variante_id);
                if (repuestos.length > 0) {
                    const sinStock: string[] = [];
                    for (const rep of repuestos) {
                        const variante = await this.varianteRepository.obtener(rep.variante_id as string, negocio_id);
                        if (variante) {
                            const stockReal = variante.stock_total ?? 0;
                            if (stockReal < rep.cantidad) {
                                sinStock.push(variante.producto?.nombre ?? variante.sku ?? 'Desconocido');
                            }
                        }
                    }
                    if (sinStock.length > 0) {
                        throw new AppError(`Para servicios con repuestos es obligatorio tener stock. No hay stock para: ${sinStock.join(', ')}`, 'STOCK_OBLIGATORIO_TALLER', 400);
                    }
                }

                // Calcular total excluyendo repuestos (sin variante_id)
                const totalServicio = cotizacion.detalles
                    .filter(d => !d.variante_id)
                    .reduce((sum, d) => sum + Number(d.subtotal ?? 0), 0);

                const dataServicio = {
                    sucursal_id,
                    cliente_id: cotizacion.cliente_id,
                    vehiculo_id: cotizacion.vehiculo_id,
                    tipo_servicio_id: tipo_servicio_id,
                    descripcion: `Convertida de cotización ${cotizacion.codigo}`,
                    total: totalServicio,
                    estado: 'RECEPCION'
                };

                const servicio = await this.registrarServicioUseCase.execute(dataServicio as any, negocio_id, usuario_id, { tx });

                // Crear Tareas para "mano de obra personalizada" (detalles sin variante y sin tipo_servicio_id)
                const manoDeObra = cotizacion.detalles.filter(d => !d.variante_id && !d.tipo_servicio_id);
                if (manoDeObra.length > 0) {
                    let isExtra = true;
                    if (tipo_servicio_id) {
                        const tipoServicioDb = await tx.tipoServicio.findUnique({
                            where: { id: tipo_servicio_id },
                            include: { opciones: true }
                        });
                        if (tipoServicioDb && tipoServicioDb.opciones.length === 0) {
                            isExtra = false;
                        }
                    }

                    await tx.servicioTarea.createMany({
                        data: manoDeObra.map(mo => ({
                            servicio_id: servicio.id,
                            nombre: mo.descripcion || 'Mano de obra',
                            extra: isExtra,
                            completado: false,
                            activo: true
                        }))
                    });
                }

                await this.cotizacionRepository.marcarConvertida(cotizacion.id, 'TALLER', servicio.id, negocio_id, sucursal_id, { tx });

                return {
                    actualizada: await this.cotizacionRepository.obtener(id, negocio_id, sucursal_id),
                    tipo: 'TALLER',
                    servicio_id: servicio.id,
                    repuestos: repuestos
                };
            }

            // Retornar la cotización actualizada
            const actualizada = await this.cotizacionRepository.obtener(id, negocio_id, sucursal_id);
            return { actualizada, tipo: cotizacion.tipo_destino, repuestos: [] };
        });

        if (resultado.tipo === 'TALLER' && resultado.repuestos && resultado.repuestos.length > 0 && resultado.servicio_id) {
            for (const rep of resultado.repuestos) {
                await this.crearServicioRepuestoUseCase.execute(
                    resultado.servicio_id,
                    rep.variante_id as string,
                    undefined,
                    rep.cantidad,
                    negocio_id,
                    sucursal_id
                );
            }
        }

        return resultado.actualizada as CotizacionSimple;
    }
}
