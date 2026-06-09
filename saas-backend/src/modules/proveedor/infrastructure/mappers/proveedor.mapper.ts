import type { proveedores } from '@prisma/client';
import type { ProveedorObtenidoDetalle, ProveedorSimple } from '../../domain/proveedor.entity.js';

export class ProveedorMapper {
    static mapDetalle(record: proveedores): ProveedorObtenidoDetalle {
        return {
            id: record.id,
            nombre: record.nombre,
            contacto: record.contacto ?? null,
            telefono: record.telefono,
            email: record.email ?? null,
            nit: record.nit ?? null,
            activo: record.activo,
            created_at: record.created_at,
            updated_at: record.updated_at,
        };
    }

    static mapSimple(record: proveedores): ProveedorSimple {
        return {
            id: record.id,
            nombre: record.nombre,
            telefono: record.telefono,
            email: record.email ?? null,
            nit: record.nit ?? null,
        };
    }
}
