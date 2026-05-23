import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { ClienteObtenidoDetalle } from "../../cliente/domain/cliente.entity.js";
import type { ClienteRepository } from "../../cliente/domain/cliente.repository.js";

interface RegistrarClienteVentaData {
    nombre: string;
    nit: string;
}

export class RegistrarClienteParaVentaUseCase {
    constructor(
        private readonly clienteRepository: ClienteRepository
    ) { }

    async execute(data: RegistrarClienteVentaData, negocio_id: string): Promise<ClienteObtenidoDetalle> {
        try {
            // Convertir solo nombre y NIT a la estructura esperada por el repositorio
            const clienteCrearData = {
                nombre: data.nombre,
                nit: data.nit,
                dpi: null,
                apellido: null,
                telefono: "", // Campo obligatorio en la BD pero no en ventas
                email: null
            };

            return await this.clienteRepository.registrar(clienteCrearData, negocio_id);
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError('El cliente ya existe en este negocio', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
