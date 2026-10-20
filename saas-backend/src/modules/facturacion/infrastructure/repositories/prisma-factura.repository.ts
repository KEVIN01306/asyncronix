import type { PrismaClient } from "@prisma/client";
import type { 
    FacturaRepository, 
    ListarFacturasFiltros, 
    ListarFacturasResultado, 
    ResumenFiscalResultado 
} from "../../domain/interfaces/factura.repository.js";
import type { CrearFacturaData, FacturaEntity } from "../../domain/entities/factura.entity.js";
import { DatabaseError } from "../../../../shared/database/errors/DatabaseError.js";

export class PrismaFacturaRepository implements FacturaRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async crear(data: CrearFacturaData): Promise<FacturaEntity> {
        try {
            return await this.prisma.factura.create({
                data: {
                    negocio_id: data.negocio_id,
                    sucursal_id: data.sucursal_id,
                    usuario_id: data.usuario_id,
                    cliente_id: data.cliente_id ?? null,
                    venta_id: data.venta_id ?? null,
                    servicio_id: data.servicio_id ?? null,
                    tipo_dte: data.tipo_dte,
                    numero_factura: data.numero_factura,
                    receptor_nit: data.receptor_nit,
                    receptor_nombre: data.receptor_nombre,
                    receptor_direccion: data.receptor_direccion ?? null,
                    emisor_afiliacion_iva: data.emisor_afiliacion_iva,
                    subtotal_sin_iva: data.subtotal_sin_iva,
                    descuento: data.descuento,
                    porcentaje_impuesto: data.porcentaje_impuesto,
                    total_impuestos: data.total_impuestos,
                    total: data.total,
                    metodo_pago: data.metodo_pago,
                    estado: data.estado,
                }
            }) as unknown as FacturaEntity;
        } catch (error: any) {
            console.error("PrismaFacturaRepository.crear error:", error);
            throw new DatabaseError("Error al crear la factura");
        }
    }

    async obtenerPorId(id: string): Promise<FacturaEntity | null> {
        try {
            return await this.prisma.factura.findUnique({
                where: { id }
            }) as unknown as FacturaEntity | null;
        } catch (error: any) {
            throw new DatabaseError("Error al obtener la factura por ID");
        }
    }

    async obtenerPorIdYNegocio(id: string, negocio_id: string): Promise<FacturaEntity | null> {
        try {
            return await this.prisma.factura.findFirst({
                where: { id, negocio_id }
            }) as unknown as FacturaEntity | null;
        } catch (error: any) {
            throw new DatabaseError("Error al obtener la factura por ID y negocio");
        }
    }

    async obtenerPorVentaId(venta_id: string): Promise<FacturaEntity | null> {
        try {
            return await this.prisma.factura.findFirst({
                where: { venta_id }
            }) as unknown as FacturaEntity | null;
        } catch (error: any) {
            throw new DatabaseError("Error al obtener la factura por Venta ID");
        }
    }

    async obtenerPorServicioId(servicio_id: string): Promise<FacturaEntity | null> {
        try {
            return await this.prisma.factura.findFirst({
                where: { servicio_id }
            }) as unknown as FacturaEntity | null;
        } catch (error: any) {
            throw new DatabaseError("Error al obtener la factura por Servicio ID");
        }
    }

    async marcarComoCertificada(
        factura_id: string,
        dte_uuid: string,
        serie: string,
        fecha_certificacion: Date,
        dte_sat_xml?: string,
        dle_sat_pdf?: string
    ): Promise<FacturaEntity> {
        try {
            return await this.prisma.factura.update({
                where: { id: factura_id },
                data: {
                    estado: 'CERTIFICADA',
                    dte_uuid,
                    serie,
                    fecha_certificacion,
                    dte_sat_xml: dte_sat_xml ?? null,
                    dle_sat_pdf: dle_sat_pdf ?? null
                }
            }) as unknown as FacturaEntity;
        } catch (error: any) {
            throw new DatabaseError(`Error al marcar la factura como certificada: ${error.message}`);
        }
    }

    async marcarComoAnulada(
        factura_id: string,
        nuevo_xml_url: string,
        motivo: string,
        acuse_anulacion: string | null
    ): Promise<FacturaEntity> {
        try {
            const factura = await this.prisma.factura.update({
                where: { id: factura_id },
                data: {
                    estado: 'ANULADA',
                    dte_sat_xml: nuevo_xml_url,
                    dle_sat_pdf: null,
                    motivo_anulacion: motivo,
                    acuse_anulacion: acuse_anulacion,
                    fecha_anulacion: new Date()
                }
            }) as unknown as FacturaEntity;
            return factura;
        } catch (error: any) {
            throw new DatabaseError(`Error al marcar la factura como anulada: ${error.message}`);
        }
    }

    async listarEmitidas(negocio_id: string, filtros: ListarFacturasFiltros): Promise<ListarFacturasResultado> {
        try {
            const where: any = {
                negocio_id,
                fecha_emision: {
                    gte: filtros.fecha_inicio,
                    lte: filtros.fecha_fin
                }
            };

            if (filtros.q && filtros.q.trim() !== '') {
                const search = filtros.q.trim();
                where.OR = [
                    { dte_uuid: { contains: search } },
                    { numero_factura: { contains: search } },
                    { serie: { contains: search } },
                    { receptor_nit: { contains: search } },
                    { receptor_nombre: { contains: search } },
                ];
            }

            const page = Math.max(1, filtros.page || 1);
            const limit = Math.max(1, filtros.limit || 10);
            const skip = (page - 1) * limit;

            const [facturas, total] = await Promise.all([
                this.prisma.factura.findMany({
                    where,
                    orderBy: { fecha_emision: 'desc' },
                    skip,
                    take: limit
                }),
                this.prisma.factura.count({ where })
            ]);

            return {
                data: facturas as unknown as FacturaEntity[],
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1
            };
        } catch (error: any) {
            console.error("PrismaFacturaRepository.listarEmitidas error:", error);
            throw new DatabaseError("Error al listar las facturas emitidas");
        }
    }

    async obtenerResumenFiscal(negocio_id: string, fecha_inicio: Date, fecha_fin: Date): Promise<ResumenFiscalResultado> {
        try {
            // Facturas válidas/activas emitidas en el período
            const whereActivas = {
                negocio_id,
                estado: { in: ['EMITIDA' as const, 'CERTIFICADA' as const] },
                fecha_emision: {
                    gte: fecha_inicio,
                    lte: fecha_fin
                }
            };

            const [aggActivas, aggAnuladas, configFiscal] = await Promise.all([
                this.prisma.factura.aggregate({
                    where: whereActivas,
                    _sum: {
                        total: true,
                        total_impuestos: true
                    },
                    _count: {
                        id: true
                    }
                }),
                this.prisma.factura.aggregate({
                    where: {
                        negocio_id,
                        estado: 'ANULADA',
                        fecha_emision: {
                            gte: fecha_inicio,
                            lte: fecha_fin
                        }
                    },
                    _sum: {
                        total: true
                    },
                    _count: {
                        id: true
                    }
                }),
                this.prisma.negocioFacturacionConfig.findUnique({
                    where: { negocio_id },
                    select: { afiliacion_iva: true }
                })
            ]);

            return {
                total_facturado: Number(aggActivas._sum.total ?? 0),
                total_impuestos_estimados: Number(aggActivas._sum.total_impuestos ?? 0),
                cantidad_facturas: aggActivas._count.id ?? 0,
                cantidad_anuladas: aggAnuladas._count.id ?? 0,
                total_anulado: Number(aggAnuladas._sum.total ?? 0),
                regimen_fiscal_actual: configFiscal?.afiliacion_iva || 'GEN'
            };
        } catch (error: any) {
            console.error("PrismaFacturaRepository.obtenerResumenFiscal error:", error);
            throw new DatabaseError("Error al calcular el resumen fiscal");
        }
    }

    async obtenerDatosParaFacturar(venta_id: string): Promise<any> {
        try {
            return await this.prisma.venta.findUnique({
                where: { id: venta_id },
                include: {
                    negocio: {
                        include: {
                            moneda: true,
                            negocioFacturacionConfig: true
                        }
                    },
                    sucursal: {
                        include: {
                            division_nivel_2: {
                                include: {
                                    division_nivel_1: {
                                        include: { pais: true }
                                    }
                                }
                            }
                        }
                    },
                    cliente: true,
                    detalles: true
                }
            });
        } catch (error: any) {
            throw new DatabaseError("Error al obtener datos para facturar la venta");
        }
    }

    async obtenerDatosParaFacturarServicio(servicio_id: string): Promise<any> {
        try {
            return await this.prisma.servicio.findUnique({
                where: { id: servicio_id },
                include: {
                    negocio: {
                        include: {
                            moneda: true,
                            negocioFacturacionConfig: true
                        }
                    },
                    sucursal: {
                        include: {
                            division_nivel_2: {
                                include: {
                                    division_nivel_1: {
                                        include: { pais: true }
                                    }
                                }
                            }
                        }
                    },
                    cliente: true,
                    tipo_servicio: true,
                    repuestos: {
                        include: { variante: { include: { producto: true } } }
                    },
                    servicioReparacion: {
                        include: {
                            servicioRepuestos: { include: { variante: { include: { producto: true } } } }
                        }
                    },
                    servicioCustodia: true
                }
            });
        } catch (error: any) {
            throw new DatabaseError("Error al obtener datos para facturar el servicio");
        }
    }

    async marcarComoError(factura_id: string): Promise<FacturaEntity> {
        try {
            return await this.prisma.factura.update({
                where: { id: factura_id },
                data: {
                    estado: 'ERROR'
                }
            }) as unknown as FacturaEntity;
        } catch (error: any) {
            throw new DatabaseError("Error al marcar factura como ERROR");
        }
    }

    async obtenerConfiguracion(negocio_id: string): Promise<any | null> {
        try {
            return await this.prisma.negocioFacturacionConfig.findUnique({
                where: { negocio_id }
            });
        } catch (error: any) {
            throw new DatabaseError("Error al obtener configuración de facturación");
        }
    }

    async obtenerConfiguracionConPais(negocio_id: string): Promise<any | null> {
        try {
            return await this.prisma.negocioFacturacionConfig.findUnique({
                where: { negocio_id },
                include: {
                    negocio: {
                        include: {
                            pais: true
                        }
                    }
                }
            });
        } catch (error: any) {
            throw new DatabaseError("Error al obtener configuración de facturación con país");
        }
    }

    async actualizarConfiguracion(negocio_id: string, data: any): Promise<any> {
        try {
            return await this.prisma.negocioFacturacionConfig.upsert({
                where: { negocio_id },
                create: {
                    ...data,
                    negocio_id
                },
                update: {
                    ...data,
                    token_temporal: null,
                    token_expira_at: null
                }
            });
        } catch (error: any) {
            console.error("PrismaFacturaRepository.actualizarConfiguracion error:", error);
            throw new DatabaseError("Error al guardar la configuración fiscal");
        }
    }

    async guardarTokenTemporal(negocio_id: string, token: string, expiraEn: Date): Promise<void> {
        try {
            await this.prisma.negocioFacturacionConfig.update({
                where: { negocio_id },
                data: {
                    token_temporal: token,
                    token_expira_at: expiraEn
                }
            });
        } catch (error: any) {
            throw new DatabaseError("Error al guardar el token temporal de Digifact");
        }
    }
}
