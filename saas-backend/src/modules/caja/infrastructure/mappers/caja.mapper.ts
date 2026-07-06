import type { CajaObtenidoDetalle, CajaSimple } from '../../domain/caja.entity.js';

export class CajaMapper {
    static mapSimple(db: any): CajaSimple {
        return {
            id: db.id,
            nombre: db.nombre,
            tipo: db.tipo,
            saldo: db.saldo,
            activo: db.activo,
            ip_autorizada: db.ip_autorizada ?? null,
            asociacion_id: db.asociacion_id ?? null,
            token_autorizado: db.token_autorizado ?? null,
            created_at: db.created_at,
            updated_at: db.updated_at,
        };
    }
}
