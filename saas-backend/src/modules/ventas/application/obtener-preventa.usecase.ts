import { PrismaErrorMapper } from '../../../shared/database/prisma/PrismaErrorMapper.js';

export class ObtenerPreVentaUseCase {
    constructor(private readonly db: any) {}

    async execute(id: string, negocio_id: string, sucursal_id: string, usuario_id: string) {
        try {
            const preventa = await this.db.preVenta.findFirst({
                where: { id, negocio_id, sucursal_id, usuario_id, activo: true },
                include: {
                    usuario: true,
                    cliente: true,
                    detalles: {
                        include: {
                            variante: { include: { producto: true } }
                        }
                    },
                    sucursal: true,
                    negocio: true
                }
            });

            if (!preventa) {
                throw new Error('PREVENTA_NO_ENCONTRADA');
            }

            return preventa;
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
