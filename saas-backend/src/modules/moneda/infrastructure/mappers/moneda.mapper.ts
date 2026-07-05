export class MonedaMapper {
    static mapSimple(db: any) {
        return {
            id: db.id,
            codigo: db.codigo,
            nombre: db.nombre,
            simbolo: db.simbolo,
            created_at: db.created_at,
            updated_at: db.updated_at,
        };
    }
}
