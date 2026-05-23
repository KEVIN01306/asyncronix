export class LineaMapper {
    static mapSimple(db: any) {
        return {
            id: db.id,
            linea: db.linea,
            created_at: db.created_at,
            updated_at: db.updated_at,
        };
    }
}
