import { PrismaPermisosRepository } from "./infrastructure/prisma-permisos.repository.js";
import prisma from "@infrastructure/config/prisma.js";
import { ObtenerModulosUseCase } from "./application/obtener-modulos.usecase.js";
import { ObtenerPermisosUseCase } from "./application/obtener-permisos.usecase.js";
import { ObtenerPermisosRolUseCase } from "./application/obtener-permisos-rol.usecase.js";
import { AsignarPermisosRolUseCase } from "./application/asignar-permisos-rol.usecase.js";
import { PermisosController } from "./presentation/permisos.controller.js";

const permisosRepository = new PrismaPermisosRepository(prisma);
const obtenerModulosUseCase = new ObtenerModulosUseCase(permisosRepository);
const obtenerPermisosUseCase = new ObtenerPermisosUseCase(permisosRepository);
const obtenerPermisosRolUseCase = new ObtenerPermisosRolUseCase(permisosRepository);
const asignarPermisosRolUseCase = new AsignarPermisosRolUseCase(permisosRepository);

export const permisosController = new PermisosController(
    obtenerModulosUseCase,
    obtenerPermisosUseCase,
    obtenerPermisosRolUseCase,
    asignarPermisosRolUseCase
);
