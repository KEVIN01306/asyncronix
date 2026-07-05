export class PaisMapper {
    static mapSimple(db: any) {
        return {
            id: db.id,
            codigo_iso: db.codigo_iso,
            nombre: db.nombre,
            codigo_tel: db.codigo_tel,
            moneda_id: db.moneda_id,
            created_at: db.created_at,
            updated_at: db.updated_at,
        };
    }
}
