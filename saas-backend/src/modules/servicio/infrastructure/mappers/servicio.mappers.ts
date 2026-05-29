import type { ServicioDetalle, ServicioSimple, ChecklistRespuestaSimple } from "../../domain/servicio.entity.js";

export const mapServicioSimple = (record: any): ServicioSimple => ({
    id: record.id,
    sucursal_id: record.sucursal_id,
    vehiculo_id: record.vehiculo_id,
    cliente_id: record.cliente_id,
    tipo_servicio_id: record.tipo_servicio_id,
    estado: record.estado,
    total: record.total,
    created_at: record.created_at,
    vehiculo: record.vehiculo ? {
        id: record.vehiculo.id,
        placa: record.vehiculo.placa,
        modelo_id: record.vehiculo.modelo_id,
        modelo_nombre: record.vehiculo.modelo?.modelo ?? null,
        marca: record.vehiculo.modelo?.marca ?? null,
        linea: record.vehiculo.modelo?.linea ?? null,
        cilindrada: record.vehiculo.modelo?.cilindrada ?? null
    } : null,
    tipo_servicio: record.tipo_servicio ? {
        id: record.tipo_servicio.id,
        nombre: record.tipo_servicio.nombre,
        precio_base: record.tipo_servicio.precio_base
    } : null,
    cliente: record.cliente ? {
        id: record.cliente.id,
        nombre: record.cliente.nombre,
        telefono: record.cliente.telefono,
        email: record.cliente.email
    } : null,
    mecanico: record.mecanico ? {
        id: record.mecanico.id,
        nombre: record.mecanico.nombre,
        apellido: record.mecanico.apellido ?? null,
        email: record.mecanico.email ?? null
    } : null
});

export const mapServicioDetalle = (record: any): ServicioDetalle => ({
    id: record.id,
    negocio_id: record.negocio_id,
    sucursal_id: record.sucursal_id,
    vehiculo_id: record.vehiculo_id,
    mecanico_id: record.mecanico_id,
    cliente_id: record.cliente_id,
    tipo_servicio_id: record.tipo_servicio_id,
    descripcion: record.descripcion,
    diagnostico: record.diagnostico,
    kilometraje: record.kilometraje,
    fecha_entrada: record.fecha_entrada,
    fecha_salida: record.fecha_salida,
    firma_entrada: record.firma_entrada,
    firma_salida: record.firma_salida,
    total: record.total,
    estado: record.estado,
    MetodoPago: record.MetodoPago,
    activo: record.activo,
    created_at: record.created_at,
    updated_at: record.updated_at,
    imagenes: (record.imagenes ?? []).map((item: any) => ({
        id: item.id,
        servicio_id: item.servicio_id,
        descripcion: item.descripcion,
        url: item.imagen,
        created_at: item.created_at,
        updated_at: item.updated_at
    })),
    checklist: (record.checklist ?? []).map((item: any) => ({
        id: item.id,
        checklist_item_id: item.checklist_item_id,
        servicio_id: item.servicio_id,
        estado: item.estado,
        observaciones: item.observaciones,
        item: item.checklist_item ? {
            id: item.checklist_item.id,
            nombre: item.checklist_item.nombre
        } : null,
        created_at: item.created_at,
        updated_at: item.updated_at
    })),
    tareas: (record.tareas ?? []).map((item: any) => ({
        id: item.id,
        servicio_id: item.servicio_id,
        nombre: item.nombre,
        completado: item.completado,
        observacion: item.observacion,
        created_at: item.created_at,
        updated_at: item.updated_at
    })),
    cliente: record.cliente ? {
        id: record.cliente.id,
        nombre: record.cliente.nombre,
        telefono: record.cliente.telefono,
        email: record.cliente.email
    } : null,
    observaciones: record.observaciones,
    tipo_servicio: record.tipo_servicio ? {
        id: record.tipo_servicio.id,
        nombre: record.tipo_servicio.nombre,
    } : null,
    repuestos: (record.ServicioRepuestoCliente ?? []).map((r: any) => ({
        id: r.id,
        servicio_id: r.servicio_id,
        repuesto: r.repuesto,
        cantidad: r.cantidad,
        created_at: r.created_at,
        updated_at: r.updated_at
    })),
    repuestos_inventario: (record.repuestos ?? []).map((r: any) => ({
        id: r.id,
        servicio_id: r.servicio_id,
        lote_id: r.lote_id,
        producto: r.lote && r.lote.producto ? { id: r.lote.producto.id, nombre: r.lote.producto.nombre } : null,
        cantidad: r.cantidad,
        precio_venta: r.precio_venta,
        costo: r.costo,
        created_at: r.created_at,
        updated_at: r.updated_at
    })),
    nombre_extra: record.nombre_extra ?? null,
    documento_extra: record.documento_extra ?? null,
    numero_extra: record.numero_extra ?? null,
    mecanico: record.mecanico ? {
        id: record.mecanico.id,
        nombre: record.mecanico.nombre,
        apellido: record.mecanico.apellido ?? null,
        email: record.mecanico.email ?? null
    } : null,
});

export const mapChecklistRespuesta = (record: any): ChecklistRespuestaSimple => ({
    id: record.id,
    checklist_item_id: record.checklist_item_id,
    servicio_id: record.servicio_id,
    estado: record.estado,
    observaciones: record.observaciones,
    item: record.checklist_item ? {
        id: record.checklist_item.id,
        nombre: record.checklist_item.nombre
    } : null,
    created_at: record.created_at,
    updated_at: record.updated_at
});
