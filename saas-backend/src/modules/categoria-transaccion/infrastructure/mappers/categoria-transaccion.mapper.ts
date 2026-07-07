import type { CategoriaTransaccion, CategoriaTransaccionSimple } from '../../domain/categoria-transaccion.entity.js';

export class CategoriaTransaccionMapper {
  static mapSimple(record: any): CategoriaTransaccionSimple {
    return {
      id: record.id,
      negocio_id: record.negocio_id ?? null,
      nombre: record.nombre,
      tipo: record.tipo,
      activo: record.activo,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }
}
