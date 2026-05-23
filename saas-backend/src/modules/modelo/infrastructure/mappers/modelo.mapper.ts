export class ModeloMapper {
    static mapSimple(db: any) {
        return {
            id: db.id,
            modelo: db.modelo,
            anio: db.anio,
            marca_id: db.marca_id,
            marca: db.marca?.marca,
            linea_id: db.linea_id,
            linea: db.linea?.linea,
            cilindrada_id: db.cilindrada_id,
            cilindrada: db.cilindrada?.cilindrada,
            created_at: db.created_at,
            updated_at: db.updated_at,
        };
    }
}
