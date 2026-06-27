import { PrismaErrorMapper } from '../../../shared/database/prisma/PrismaErrorMapper.js';

export class CrearPreVentaUseCase {
    constructor(private readonly db: any) {}

    async execute(data: any, negocio_id: string, sucursal_id: string, usuario_id: string) {
        try {
            const itemsNormalizados = this.normalizarItems(data.items ?? []);

            return await this.db.preVenta.create({
                data: {
                    negocio_id,
                    sucursal_id,
                    usuario_id,
                    activo: true,
                    cliente_id: data.cliente_id ?? null,
                    detalles: {
                        create: itemsNormalizados.map((item: any) => ({
                            variante_id: item.variante_id,
                            descripcion: item.descripcion ?? '',
                            cantidad: item.cantidad,
                            precio: Number(item.precio ?? 0)
                        }))
                    }
                },
                include: {
                    detalles: true
                }
            });
        } catch (error) {
            throw PrismaErrorMapper.map(error);
        }
    }

    private normalizarItems(items: any[]) {
        const agrupado = new Map<string, { variante_id: string; descripcion: string; cantidad: number; precio: number }>();

        for (const item of items) {
            const varianteId = String(item?.variante_id ?? '');
            if (!varianteId) continue;

            const cantidad = Number(item?.cantidad ?? 0);
            if (!Number.isFinite(cantidad) || cantidad <= 0) continue;

            const precio = Number(item?.precio ?? 0);
            const descripcion = String(item?.descripcion ?? '');
            const existente = agrupado.get(varianteId);

            if (existente) {
                existente.cantidad += cantidad;
                existente.precio = Number.isFinite(precio) ? precio : existente.precio;
                if (descripcion.trim()) {
                    existente.descripcion = descripcion;
                }
                continue;
            }

            agrupado.set(varianteId, {
                variante_id: varianteId,
                descripcion,
                cantidad,
                precio: Number.isFinite(precio) ? precio : 0
            });
        }

        return Array.from(agrupado.values());
    }
}
