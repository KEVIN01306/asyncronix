import type { PrismaClient } from "@prisma/client";
import type { CotizacionRepository } from "../domain/cotizacion.repository.js";
import type { CotizacionCrear, CotizacionCompleta, CotizacionSimple } from "../domain/cotizacion.entity.js";
import type { Paginated } from "@shared/domain/paginated.js";
import type { Pagination } from "@shared/domain/pagination.js";
import { PrismaErrorMapper } from "@shared/database/prisma/PrismaErrorMapper.js";
import AppError from "@shared/errors/AppError.js";
import { CotizacionMapper } from "./mappers/cotizacion.mapper.js";

async function obtenerSiguienteCorrelativoCotizacion(prisma: any, negocio_id: string): Promise<number> {
    const ultima = await prisma.cotizacion.findFirst({
        where: { negocio_id },
        orderBy: { correlativo: 'desc' },
        select: { correlativo: true },
    });
    return ultima ? ultima.correlativo + 1 : 1;
}

function generarCodigo(Prefijo: string, correlativo: number): string {
    const prefix = Prefijo.replace(/\s+/g, '').toUpperCase().slice(0, 4).padEnd(4, 'X');
    const numero = String(correlativo).padStart(9, '0');
    return `${prefix}${numero}`;
}

export class PrismaCotizacionRepository implements CotizacionRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async crear(data: CotizacionCrear, negocio_id: string, sucursal_id: string, usuario_id: string): Promise<CotizacionCompleta> {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const negocio = await tx.negocio.findUnique({
                    where: { id: negocio_id },
                    select: { nombre: true },
                });
                // Como prefijo usaremos 'COT-' seguido de la primera letra del negocio para que cuadre con generarCodigo
                // o simplemente pasaremos "COT" para que genere "COTX000000001"
                // Pero según la indicación 'COT-000001', podemos adaptar un generador simple para cotizaciones.
                const correlativo = await obtenerSiguienteCorrelativoCotizacion(tx, negocio_id);
                // "COT-" + 6 dígitos
                const codigo = `COT-${String(correlativo).padStart(6, '0')}`;

                let total = 0;
                const detallesData = data.detalles.map(d => {
                    const subtotal = (d.precio_unitario * d.cantidad) - (d.descuento || 0);
                    total += subtotal;
                    return {
                        variante_id: d.variante_id ?? null,
                        tipo_servicio_id: d.tipo_servicio_id ?? null,
                        descripcion: d.descripcion,
                        cantidad: d.cantidad,
                        precio_unitario: d.precio_unitario,
                        descuento: d.descuento || 0,
                        subtotal: subtotal
                    };
                });

                // Fecha de validez: por defecto 15 días si no viene
                const fechaValidez = data.fecha_validez ? new Date(data.fecha_validez) : new Date(new Date().setDate(new Date().getDate() + 15));

                const created = await tx.cotizacion.create({
                    data: {
                        negocio_id,
                        sucursal_id,
                        usuario_id,
                        cliente_id: data.cliente_id ?? null,
                        vehiculo_id: data.vehiculo_id ?? null,
                        correlativo,
                        codigo,
                        total,
                        fecha_validez: fechaValidez,
                        tipo_destino: data.tipo_destino,
                        terminos: data.terminos ?? null,
                        estado: 'PENDIENTE',
                        detalles: {
                            create: detallesData
                        }
                    },
                    include: {
                        cliente: true,
                        vehiculo: true,
                        usuario: true,
                        detalles: true
                    }
                });

                return CotizacionMapper.toCompleta(created);
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async obtener(id: string, negocio_id: string, sucursal_id: string): Promise<CotizacionCompleta | null> {
        try {
            const cotizacion = await this.prisma.cotizacion.findFirst({
                where: { id, negocio_id, sucursal_id },
                include: {
                    cliente: true,
                    vehiculo: true,
                    usuario: true,
                    detalles: {
                        include: {
                            variante: {
                                include: {
                                    producto: true
                                }
                            },
                            tipo_servicio: true
                        }
                    }
                }
            });
            return cotizacion ? CotizacionMapper.toCompleta(cotizacion) : null;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async listar(negocio_id: string, sucursal_id: string, pagination: Pagination, q?: string, estado?: string, cliente_id?: string): Promise<Paginated<CotizacionSimple>> {
        const { page, perPage } = pagination;
        const skip = (page - 1) * perPage;

        const where: any = { negocio_id, sucursal_id };
        if (estado) where.estado = estado;
        if (cliente_id) where.cliente_id = cliente_id;

        if (q) {
            where.OR = [
                { codigo: { contains: q } },
                { cliente: { nombre: { contains: q } } },
                { vehiculo: { placa: { contains: q } } }
            ];
        }

        try {
            const [total, items] = await Promise.all([
                this.prisma.cotizacion.count({ where }),
                this.prisma.cotizacion.findMany({
                    where,
                    skip,
                    take: perPage,
                    orderBy: { created_at: 'desc' },
                    include: {
                        cliente: true,
                        vehiculo: true,
                        usuario: true
                    }
                })
            ]);

            return { total, data: items.map(CotizacionMapper.toSimple), page, perPage };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async actualizarEstado(id: string, estado: string, negocio_id: string, sucursal_id: string): Promise<CotizacionSimple> {
        try {
            const updated = await this.prisma.cotizacion.updateMany({
                where: { id, negocio_id, sucursal_id },
                data: { estado: estado as any }
            });
            
            if (updated.count === 0) {
                throw new AppError("Cotización no encontrada", "NOT_FOUND", 404);
            }

            const cotizacion = await this.prisma.cotizacion.findFirst({
                where: { id, negocio_id, sucursal_id },
                include: { cliente: true, vehiculo: true, usuario: true }
            });
            
            return cotizacion ? CotizacionMapper.toSimple(cotizacion) : ({} as any);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    async marcarConvertida(id: string, tipoDestino: 'VENTA_DIRECTA' | 'TALLER', referenciaId: string, negocio_id: string, sucursal_id: string, options?: { tx?: any }): Promise<void> {
        const db = options?.tx || this.prisma;
        try {
            await db.cotizacion.update({
                where: { id, negocio_id, sucursal_id },
                data: {
                    preventa_id: tipoDestino === 'VENTA_DIRECTA' ? referenciaId : undefined,
                    servicio_id: tipoDestino === 'TALLER' ? referenciaId : undefined,
                }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
