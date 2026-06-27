import { PrismaErrorMapper } from '../../../shared/database/prisma/PrismaErrorMapper.js';

export class ActualizarCantidadPreVentaUseCase {
    constructor(private readonly db: any) {}

    async execute(detalleId: string, cantidad: number, negocio_id: string, sucursal_id: string) {
        try {
            if (cantidad < 1) {
                throw new Error('CANTIDAD_INVALIDA');
            }

            const detalle = await this.db.preVentaDetalle.findFirst({
                where: { id: detalleId },
                include: { pre_venta: true }
            });

            if (!detalle || detalle.pre_venta.negocio_id !== negocio_id || detalle.pre_venta.sucursal_id !== sucursal_id) {
                throw new Error('DETALLE_PREVENTA_NO_ENCONTRADO');
            }

            const updated = await this.db.preVentaDetalle.update({
                where: { id: detalleId },
                data: { cantidad, precio: detalle.precio },
                include: { pre_venta: true }
            });

            await this.db.preVenta.update({
                where: { id: detalle.pre_venta_id },
                data: { updated_at: new Date() }
            });

            return { detalle: updated, preventa: updated.pre_venta };
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
