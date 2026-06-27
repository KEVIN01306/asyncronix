import { PrismaErrorMapper } from '../../../shared/database/prisma/PrismaErrorMapper.js';

export class EliminarDetallePreVentaUseCase {
    constructor(private readonly db: any) {}

    async execute(detalleId: string, negocio_id: string, sucursal_id: string, usuario_id: string) {
        try {
            const detalle = await this.db.preVentaDetalle.findFirst({
                where: { id: detalleId },
                include: { pre_venta: true }
            });

            if (!detalle || !detalle.pre_venta || !detalle.pre_venta.activo) {
                throw new Error('DETALLE_PREVENTA_NO_ENCONTRADO');
            }

            if (
                detalle.pre_venta.negocio_id !== negocio_id ||
                detalle.pre_venta.sucursal_id !== sucursal_id ||
                detalle.pre_venta.usuario_id !== usuario_id
            ) {
                throw new Error('DETALLE_PREVENTA_NO_ENCONTRADO');
            }

            await this.db.preVentaDetalle.delete({ where: { id: detalleId } });

            await this.db.preVenta.update({
                where: { id: detalle.pre_venta_id },
                data: { updated_at: new Date() }
            });

            const preventaActualizada = await this.db.preVenta.findUnique({
                where: { id: detalle.pre_venta_id },
                include: { detalles: true }
            });

            return preventaActualizada;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
