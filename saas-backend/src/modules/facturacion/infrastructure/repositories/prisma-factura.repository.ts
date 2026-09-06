import type { PrismaClient } from "@prisma/client";
import type { FacturaRepository } from "../../domain/interfaces/factura.repository.js";
import type { CrearFacturaData, FacturaEntity } from "../../domain/entities/factura.entity.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";

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
                    subtotal_sin_iva: data.subtotal_sin_iva,
                    descuento: data.descuento,
                    iva: data.iva,
                    total: data.total,
                    metodo_pago: data.metodo_pago,
                    estado: data.estado,
                }
            });
        } catch (error: any) {
            console.error("PrismaFacturaRepository.crear error:", error);
            throw new DatabaseError("Error al crear la factura");
        }
    }

    async obtenerPorId(id: string): Promise<FacturaEntity | null> {
        try {
            return await this.prisma.factura.findUnique({
                where: { id }
            });
        } catch (error: any) {
            throw new DatabaseError("Error al obtener la factura por ID");
        }
    }

    async obtenerPorVentaId(venta_id: string): Promise<FacturaEntity | null> {
        try {
            return await this.prisma.factura.findFirst({
                where: { venta_id }
            });
        } catch (error: any) {
            throw new DatabaseError("Error al obtener la factura por Venta ID");
        }
    }

    async obtenerPorServicioId(servicio_id: string): Promise<FacturaEntity | null> {
        try {
            return await this.prisma.factura.findFirst({
                where: { servicio_id }
            });
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
            });
        } catch (error: any) {
            throw new DatabaseError(`Error al marcar la factura como error: ${error.message}`);
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
            });
            return factura;
        } catch (error: any) {
            throw new DatabaseError(`Error al marcar la factura como anulada: ${error.message}`);
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
            });
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
