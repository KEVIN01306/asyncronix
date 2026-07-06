export class BancoMapper {
    static mapSimple(db: any) {
        return {
            id: db.id,
            nombre_comercial: db.nombre_comercial,
            razon_social: db.razon_social,
            activo: db.activo,
            created_at: db.created_at,
            updated_at: db.updated_at,
        };
    }
}
