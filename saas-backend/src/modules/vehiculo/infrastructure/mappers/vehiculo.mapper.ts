export class VehiculoMapper {
    static mapSimple(db: any) {
        const modelo = db.modelo ? {
            id: db.modelo.id,
            modelo: db.modelo.modelo,
            anio: db.modelo.anio,
            marca_id: db.modelo.marca_id,
            linea_id: db.modelo.linea_id,
            cilindrada_id: db.modelo.cilindrada_id,
            vehiculo_tipo_id: db.modelo.vehiculo_tipo_id,
            marca: db.modelo.marca ? {
                id: db.modelo.marca.id,
                marca: db.modelo.marca.marca
            } : null,
            linea: db.modelo.linea ? {
                id: db.modelo.linea.id,
                linea: db.modelo.linea.linea
            } : null,
            cilindrada: db.modelo.cilindrada ? {
                id: db.modelo.cilindrada.id,
                cilindrada: db.modelo.cilindrada.cilindrada
            } : null
        } : null;

        return {
            id: db.id,
            placa: db.placa,
            modelo_id: db.modelo_id,
            avatar_url: db.avatar_url,
            calcomania_url: db.calcomania_url,
            vehiculo_tipo_id: db.vehiculo_tipo_id,
            modelo,
            marca: modelo?.marca ?? null,
            linea: modelo?.linea ?? null,
            cilindrada: modelo?.cilindrada ?? null,
            vehiculo_tipo: db.vehiculo_tipo ? {
                id: db.vehiculo_tipo.id,
                tipo: db.vehiculo_tipo.tipo
            } : null,
            cliente_id: db.cliente_id,
            cliente: db.cliente ? {
                id: db.cliente.id,
                nombre: db.cliente.nombre,
                nit: db.cliente.nit,
                dpi: db.cliente.dpi
            } : null,
            activo: db.activo,
            created_at: db.created_at,
            updated_at: db.updated_at
        }
    }

    static mapDetalle(db: any) {
        const modelo = db.modelo ? {
            id: db.modelo.id,
            modelo: db.modelo.modelo,
            anio: db.modelo.anio,
            marca_id: db.modelo.marca_id,
            linea_id: db.modelo.linea_id,
            cilindrada_id: db.modelo.cilindrada_id,
            vehiculo_tipo_id: db.modelo.vehiculo_tipo_id,
            marca: db.modelo.marca ? {
                id: db.modelo.marca.id,
                marca: db.modelo.marca.marca
            } : null,
            linea: db.modelo.linea ? {
                id: db.modelo.linea.id,
                linea: db.modelo.linea.linea
            } : null,
            cilindrada: db.modelo.cilindrada ? {
                id: db.modelo.cilindrada.id,
                cilindrada: db.modelo.cilindrada.cilindrada
            } : null
        } : null;

        return {
            id: db.id,
            negocio_id: db.negocio_id,
            placa: db.placa,
            modelo_id: db.modelo_id,
            avatar_url: db.avatar_url,
            calcomania_url: db.calcomania_url,
            vehiculo_tipo_id: db.vehiculo_tipo_id,
            modelo,
            marca: modelo?.marca ?? null,
            linea: modelo?.linea ?? null,
            cilindrada: modelo?.cilindrada ?? null,
            vehiculo_tipo: db.vehiculo_tipo ? {
                id: db.vehiculo_tipo.id,
                tipo: db.vehiculo_tipo.tipo
            } : null,
            cliente_id: db.cliente_id,
            cliente: db.cliente ? {
                id: db.cliente.id,
                nombre: db.cliente.nombre,
                nit: db.cliente.nit,
                dpi: db.cliente.dpi
            } : null,
            activo: db.activo,
            created_at: db.created_at,
            updated_at: db.updated_at
        }
    }
}
