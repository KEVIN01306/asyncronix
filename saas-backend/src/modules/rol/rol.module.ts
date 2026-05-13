import { PrismaRolRepository } from "./infrastructure/prisma-rol.repository.js";
import prisma from "@infrastructure/config/prisma.js";
import { ObtenerRolUseCase } from "./application/obtener-rol.usecase.js";
import { ObtenerRolesUseCase } from "./application/obtener-roles.usecase.js";
import { RegistrarRolUseCase } from "./application/registrar-rol.usecase.js";
import { ActualizarRolUseCase } from "./application/actualizar-rol.usecase.js";
import { EliminarRolUseCase } from "./application/eliminar-rol.usecase.js";
import { RolController } from "./presentation/rol.controller.js";

const rolRepository = new PrismaRolRepository(prisma);

const obtenerRolUseCase = new ObtenerRolUseCase(rolRepository);
const obtenerRolesUseCase = new ObtenerRolesUseCase(rolRepository);
const registrarRolUseCase = new RegistrarRolUseCase(rolRepository);
const actualizarRolUseCase = new ActualizarRolUseCase(rolRepository);
const eliminarRolUseCase = new EliminarRolUseCase(rolRepository);

export const rolController = new RolController(
    obtenerRolUseCase,
    obtenerRolesUseCase,
    registrarRolUseCase,
    actualizarRolUseCase,
    eliminarRolUseCase
);
