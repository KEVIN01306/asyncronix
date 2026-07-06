import type { CajaObtenidoDetalle, CajaSimple } from '../../domain/caja.entity.js';

export class CajaMapper {
    static mapSimple(db: any): CajaSimple {
        return {
            id: db.id,
            nombre: db.nombre,
            tipo: db.tipo,
            saldo: db.saldo,
            activo: db.activo,
            created_at: db.created_at,
            updated_at: db.updated_at,
        };
    }
}
