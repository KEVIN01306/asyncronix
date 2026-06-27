import { PrismaErrorMapper } from '../../../shared/database/prisma/PrismaErrorMapper.js';

export class AgregarDetallePreVentaUseCase {
    constructor(private readonly db: any) {}

    async execute(preventaId: string, item: any, negocio_id: string, sucursal_id: string, usuario_id: string) {
        try {
            const preventa = await this.db.preVenta.findUnique({ where: { id: preventaId }, include: { detalles: true } });
            if (!preventa || preventa.negocio_id !== negocio_id || preventa.sucursal_id !== sucursal_id || preventa.usuario_id !== usuario_id || !preventa.activo) {
                throw new Error('PREVENTA_NO_ENCONTRADA');
            }

            const detalleExistente = await this.db.preVentaDetalle.findFirst({
                where: {
                    pre_venta_id: preventaId,
                    variante_id: item.variante_id
                }
            });

            if (detalleExistente) {
                await this.db.preVentaDetalle.update({
                    where: { id: detalleExistente.id },
                    data: {
                        cantidad: Number(detalleExistente.cantidad ?? 0) + Number(item.cantidad ?? 0),
                        precio: Number(item.precio ?? detalleExistente.precio ?? 0),
                        descripcion: item.descripcion ?? detalleExistente.descripcion ?? ''
                    }
                });
            } else {
                await this.db.preVentaDetalle.create({
                    data: {
                        pre_venta_id: preventaId,
                        variante_id: item.variante_id,
                        descripcion: item.descripcion ?? '',
                        cantidad: item.cantidad,
                        precio: Number(item.precio ?? 0)
                    }
                });
            }

            const updated = await this.db.preVenta.findUnique({ where: { id: preventaId }, include: { detalles: true } });
            return updated;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
