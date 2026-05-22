import type { clientes, negocios } from "@prisma/client";
import type { ClienteObtenidoDetalle, ClienteSimple } from "../../domain/cliente.entity.js";

type PrismaClienteConNegocio = clientes & {
    negocios: negocios;
};

export class ClienteMapper {
    static mapDetalle(cliente: PrismaClienteConNegocio): ClienteObtenidoDetalle {
        return {
            id: cliente.id,
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            telefono: cliente.telefono,
            email: cliente.email,
            nit: cliente.nit,
            dpi: cliente.dpi,
            created_at: cliente.created_at,
            updated_at: cliente.updated_at,
        };
    }

    static mapSimple(cliente: PrismaClienteConNegocio): ClienteSimple {
        return {
            id: cliente.id,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email,
            nit: cliente.nit,
            dpi: cliente.dpi,
        };
    }
}
