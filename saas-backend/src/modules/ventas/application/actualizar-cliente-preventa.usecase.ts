import { PrismaErrorMapper } from '../../../shared/database/prisma/PrismaErrorMapper.js';
import AppError from '../../../shared/errors/AppError.js';

export class ActualizarClientePreVentaUseCase {
    constructor(private readonly db: any) {}

    async execute(id: string, cliente_id: string | null, negocio_id: string, sucursal_id: string, usuario_id: string) {
        try {
            const preventa = await this.db.preVenta.findFirst({
                where: { id, negocio_id, sucursal_id, usuario_id, activo: true },
                include: { cotizacion: true }
            });

            if (!preventa) {
                throw new Error('PREVENTA_NO_ENCONTRADA');
            }
            if (preventa.cotizacion) {
                throw new AppError('No se puede modificar una preventa que proviene de una cotización.', 'PREVENTA_BLOQUEADA', 400);
            }

            return await this.db.preVenta.update({
                where: { id },
                data: { cliente_id: cliente_id ?? null },
                include: { detalles: true }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
