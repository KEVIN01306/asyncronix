import type { CuentaBancariaObtenidoDetalle, CuentaBancariaSimple } from '../../domain/cuenta-bancaria.entity.js';

export class CuentaBancariaMapper {
    static mapSimple(db: any): CuentaBancariaSimple {
        return {
            id: db.id,
            banco_id: db.banco_id,
            moneda_id: db.moneda_id,
            numero_cuenta: db.numero_cuenta,
            nombre_titular: db.nombre_titular,
            tipo: db.tipo,
            saldo: db.saldo,
            activo: db.activo,
            created_at: db.created_at,
            updated_at: db.updated_at,
            banco: db.banco
                ? {
                        id: db.banco.id,
                        nombre_comercial: db.banco.nombre_comercial,
                }
                : { id: db.banco_id, nombre_comercial: db.banco_id },
            moneda: db.moneda
                ? {
                        id: db.moneda.id,
                        codigo: db.moneda.codigo,
                        nombre: db.moneda.nombre,
                        simbolo: db.moneda.simbolo,
                        activo: db.moneda.activo,
                        created_at: db.moneda.created_at,
                        updated_at: db.moneda.updated_at,
                    }
                : null,
        };
    }
}
