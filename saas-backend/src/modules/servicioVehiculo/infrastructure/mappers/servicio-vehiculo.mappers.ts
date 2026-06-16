import { mapServicioDetalle, mapServicioSimple } from "./servicio.mappers.js";

// Helpers to build a synthetic `servicio` shaped record from a `servicioVehiculo`
// DB record. This is a lightweight adapter used while migrating persistence to
// the `ServicioVehiculo` model.
export const toServicioRecordFromServicioVehiculo = (record: any) => {
    if (!record) return null;
    const servicio = record.servicio ?? {};
    // merge top-level fields preferring `servicio` values and adding fields
    // from servicioVehiculo (kilometraje, estado mapping, mecanico via relation)
    const merged = {
        ...servicio,
        id: servicio.id,
        vehiculo_id: record.vehiculo_id ?? servicio.vehiculo_id,
        vehiculo: record.vehiculo ?? servicio.vehiculo,
        mecanico: record.mecanico ?? servicio.mecanico,
        recepcionista_id: servicio.recepcionista_id ?? null,
        kilometraje: (record.kilometraje ?? servicio.kilometraje) as any,
        kilometraje_proximo: (record.proximoKilometraje ?? servicio.kilometraje_proximo) as any,
        estado: (record.estado ?? servicio.estado) as any,
        // include other relations that mappers expect
        imagenes: servicio.imagenes ?? [],
        checklist: servicio.checklist ?? [],
        tareas: servicio.tareas ?? [],
        ServicioRepuestoCliente: servicio.ServicioRepuestoCliente ?? [],
        repuestos: servicio.repuestos ?? [],
        tipo_servicio: servicio.tipo_servicio ?? null,
        cliente: servicio.cliente ?? null,
        negocio_id: servicio.negocio_id ?? null,
        sucursal_id: servicio.sucursal_id ?? null,
        descripcion: servicio.descripcion ?? null,
        diagnostico: servicio.diagnostico ?? null,
        total: servicio.total ?? 0,
        created_at: servicio.created_at ?? record.created_at,
        updated_at: servicio.updated_at ?? record.updated_at
    };
    return merged;
}

export const mapServicioVehiculoToServicioSimple = (record: any) => mapServicioSimple(toServicioRecordFromServicioVehiculo(record));
export const mapServicioVehiculoToServicioDetalle = (record: any) => mapServicioDetalle(toServicioRecordFromServicioVehiculo(record));
