export class CilindradaMapper {
    static mapSimple(db: any) {
        return {
            id: db.id,
            cilindrada: db.cilindrada,
            created_at: db.created_at,
            updated_at: db.updated_at,
        };
    }
}
