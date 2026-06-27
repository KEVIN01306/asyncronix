import AppError from '../../../shared/errors/AppError.js';
import { PrismaErrorMapper } from '../../../shared/database/prisma/PrismaErrorMapper.js';
import type { HashProvider } from '../../../shared/domain/hash.provider.js';

export class ValidarPinCajaUseCase {
    constructor(private readonly db: any, private readonly hashProvider: HashProvider) {}

    async execute(pin: string, negocio_id: string, sucursal_id: string) {
        try {
            const usuarios = await this.db.usuario.findMany({
                where: { negocio_id, sucursal_id, activo: true },
                include: { roles: { include: { permisos: true } } }
            });

            for (const u of usuarios) {
                if (!u.pin_caja) continue;
                const coincide = await this.hashProvider.compare(String(pin), u.pin_caja);
                if (!coincide) continue;

                // recolectar permisos del usuario
                const permisos = (u.roles ?? []).flatMap((r: any) => (r.permisos ?? []).map((p: any) => p.codigo));
                const autorizado = permisos.includes('VENTAS_FORZAR_STOCK');
                if (!autorizado) {
                    throw new AppError('El usuario no posee permiso para forzar stock', 'FORBIDDEN', 403);
                }

                return { usuario: { id: u.id, nombre: u.nombre, apellido: u.apellido }, autorizado: true };
            }

            throw new AppError('PIN inválido', 'PIN_INVALIDO', 400);
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }
}
