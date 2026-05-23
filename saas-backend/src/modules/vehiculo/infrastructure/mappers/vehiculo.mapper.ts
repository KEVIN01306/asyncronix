export class VehiculoMapper {
    static mapSimple(db: any) {
        return {
            id: db.id,
            placa: db.placa,
            modelo_id: db.modelo_id,
            avatar_url: db.avatar_url,
            calcomania_url: db.calcomania_url,
            vehiculo_tipo_id: db.vehiculo_tipo_id
        }
    }

    static mapDetalle(db: any) {
        return {
            id: db.id,
            negocio_id: db.negocio_id,
            placa: db.placa,
            modelo_id: db.modelo_id,
            avatar_url: db.avatar_url,
            calcomania_url: db.calcomania_url,
            vehiculo_tipo_id: db.vehiculo_tipo_id,
            cliente_id: db.cliente_id,
            activo: db.activo,
            created_at: db.created_at,
            updated_at: db.updated_at
        }
    }
}
