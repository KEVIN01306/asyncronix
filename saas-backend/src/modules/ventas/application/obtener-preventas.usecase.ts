import { PrismaErrorMapper } from '../../../shared/database/prisma/PrismaErrorMapper.js';

export class ObtenerPreVentasUseCase {
    constructor(private readonly db: any) {}

    async execute(negocio_id: string, sucursal_id: string, usuario_id: string) {
        try {
            return await this.db.preVenta.findMany({
                where: { negocio_id, sucursal_id, usuario_id, activo: true },
                include: {
                    usuario: true,
                    detalles: true,
                    sucursal: true,
                    negocio: true,
                    cotizacion: true
                },
                orderBy: { created_at: 'desc' }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
