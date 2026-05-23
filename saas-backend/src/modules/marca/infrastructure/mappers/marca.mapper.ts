export class MarcaMapper {
    static mapSimple(db: any) {
        return {
            id: db.id,
            marca: db.marca,
            created_at: db.created_at,
            updated_at: db.updated_at,
        };
    }
}
