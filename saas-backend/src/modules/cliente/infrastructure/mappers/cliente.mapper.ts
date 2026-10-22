import type { Cliente as PrismaCliente, Negocio as PrismaNegocio } from "@prisma/client";
import type { ClienteObtenidoDetalle, ClienteSimple, ConteoRelacionesCliente } from "../../domain/cliente.entity.js";

type PrismaClienteConNegocios = PrismaCliente & {
    negocios?: PrismaNegocio[];
};

export class ClienteMapper {
    static mapDetalle(
        cliente: PrismaClienteConNegocios,
        conteo?: ConteoRelacionesCliente,
        reutilizado?: boolean
    ): ClienteObtenidoDetalle {
        return {
            id: cliente.id,
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            telefono: cliente.telefono,
            email: cliente.email,
            password_hash: cliente.password_hash,
            nit: cliente.nit,
            dpi: cliente.dpi,
            created_at: cliente.created_at,
            updated_at: cliente.updated_at,
            negocios: cliente.negocios?.map((n) => ({
                id: n.id,
                nombre: n.nombre,
                nombre_comercial: n.nombre_comercial,
            })),
            conteo_relaciones: conteo,
            reutilizado,
        };
    }

    static mapSimple(cliente: PrismaClienteConNegocios): ClienteSimple {
        return {
            id: cliente.id,
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            telefono: cliente.telefono,
            email: cliente.email,
            nit: cliente.nit,
            dpi: cliente.dpi,
            negocios: cliente.negocios?.map((n) => ({
                id: n.id,
                nombre: n.nombre,
                nombre_comercial: n.nombre_comercial,
            })),
        };
    }
}
