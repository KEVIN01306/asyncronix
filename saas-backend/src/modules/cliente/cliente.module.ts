import { PrismaClienteRepository } from "./infrastructure/prisma-cliente.repository.js";
import { ClienteController } from "./presentation/cliente.controller.js";
import prisma from "@infrastructure/config/prisma.js";
import { ObtenerClienteUseCase } from "./application/obtener-cliente.usecase.js";
import { ObtenerClientesUseCase } from "./application/obtener-clientes.js";
import { RegistrarClienteUseCase } from "./application/registrar-cliente.usecase.js";
import { ActualizarClienteUseCase } from "./application/actualizar-cliente.usecase.js";
import { EliminarClienteUseCase } from "./application/eliminar-cliente.usecase.js";

const clienteRepository = new PrismaClienteRepository(prisma);

const obtenerClienteUseCase = new ObtenerClienteUseCase(clienteRepository);
const obtenerClientesUseCase = new ObtenerClientesUseCase(clienteRepository);
const registrarClienteUseCase = new RegistrarClienteUseCase(clienteRepository);
const actualizarClienteUseCase = new ActualizarClienteUseCase(clienteRepository);
const eliminarClienteUseCase = new EliminarClienteUseCase(clienteRepository);

export const clienteController = new ClienteController(
    obtenerClienteUseCase,
    obtenerClientesUseCase,
    registrarClienteUseCase,
    actualizarClienteUseCase,
    eliminarClienteUseCase
);
