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
            telefono: cliente.telefono,
            email: cliente.email,
            direccion_entrega: cliente.direccion_entrega,
            fecha_registro: cliente.fecha_registro,
        };
    }

    static mapSimple(cliente: PrismaClienteConNegocio): ClienteSimple {
        return {
            id: cliente.id,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email,
        };
    }
}
