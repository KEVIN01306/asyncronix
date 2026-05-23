export class VehiculoTipoMapper {
    static mapSimple(db: any) {
        return {
            id: db.id,
            tipo: db.tipo,
            created_at: db.created_at,
            updated_at: db.updated_at,
        };
    }
}
