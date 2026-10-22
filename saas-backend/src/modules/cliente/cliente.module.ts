import prisma from "@infrastructure/config/prisma.js";
import { Argon2HashProvider } from "../../shared/infrastructure/argon2-hash.provider.js";
import { ResendEmailProvider } from "../../shared/infrastructure/providers/resend-email.provider.js";
import { PrismaClienteRepository } from "./infrastructure/prisma-cliente.repository.js";
import { ClienteController } from "./presentation/cliente.controller.js";
import { ObtenerClienteUseCase } from "./application/obtener-cliente.usecase.js";
import { ObtenerClientesUseCase } from "./application/obtener-clientes.js";
import { RegistrarClienteUseCase } from "./application/registrar-cliente.usecase.js";
import { ActualizarClienteUseCase } from "./application/actualizar-cliente.usecase.js";
import { EliminarClienteUseCase } from "./application/eliminar-cliente.usecase.js";
import { BuscarClientePorDocumentoUseCase } from "./application/buscar-cliente-por-documento.usecase.js";
import { BuscarClienteGlobalUseCase } from "./application/buscar-cliente-global.usecase.js";
import { ObtenerResumenUnificacionUseCase } from "./application/obtener-resumen-unificacion.usecase.js";
import { UnificarClientesUseCase } from "./application/unificar-clientes.usecase.js";
import { ReenviarCredencialesClienteUseCase } from "./application/reenviar-credenciales-cliente.usecase.js";

export const clienteRepository = new PrismaClienteRepository(prisma);
const hashProvider = new Argon2HashProvider();
const emailProvider = new ResendEmailProvider();

export const obtenerClienteUseCase = new ObtenerClienteUseCase(clienteRepository);
export const obtenerClientesUseCase = new ObtenerClientesUseCase(clienteRepository);
export const registrarClienteUseCase = new RegistrarClienteUseCase(clienteRepository, hashProvider, emailProvider);
export const actualizarClienteUseCase = new ActualizarClienteUseCase(clienteRepository);
export const eliminarClienteUseCase = new EliminarClienteUseCase(clienteRepository);
export const buscarClientePorDocumentoUseCase = new BuscarClientePorDocumentoUseCase(clienteRepository);
export const buscarClienteGlobalUseCase = new BuscarClienteGlobalUseCase(clienteRepository);
export const obtenerResumenUnificacionUseCase = new ObtenerResumenUnificacionUseCase(clienteRepository);
export const unificarClientesUseCase = new UnificarClientesUseCase(clienteRepository, hashProvider, emailProvider);
export const reenviarCredencialesClienteUseCase = new ReenviarCredencialesClienteUseCase(clienteRepository, hashProvider, emailProvider);

export const clienteController = new ClienteController(
    obtenerClienteUseCase,
    obtenerClientesUseCase,
    registrarClienteUseCase,
    actualizarClienteUseCase,
    eliminarClienteUseCase,
    buscarClientePorDocumentoUseCase,
    buscarClienteGlobalUseCase,
    obtenerResumenUnificacionUseCase,
    unificarClientesUseCase,
    reenviarCredencialesClienteUseCase
);
