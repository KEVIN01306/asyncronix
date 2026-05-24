import prisma from "@infrastructure/config/prisma.js";
import { ActualizarOpcionServicioUseCase } from "./application/actualizar-opcion-servicio.usecase.js";
import { EliminarOpcionServicioUseCase } from "./application/eliminar-opcion-servicio.usecase.js";
import { ObtenerOpcionServicioUseCase } from "./application/obtener-opcion-servicio.usecase.js";
import { ObtenerOpcionesServicioUseCase } from "./application/obtener-opciones-servicio.usecase.js";
import { RegistrarOpcionServicioUseCase } from "./application/registrar-opcion-servicio.usecase.js";
import { PrismaOpcionServicioRepository } from "./infrastructure/prisma-opcion-servicio.repository.js";
import { OpcionServicioController } from "./presentation/opcion-servicio.controller.js";

const opcionServicioRepository = new PrismaOpcionServicioRepository(prisma);

const obtenerOpcionesServicioUseCase = new ObtenerOpcionesServicioUseCase(opcionServicioRepository);
const obtenerOpcionServicioUseCase = new ObtenerOpcionServicioUseCase(opcionServicioRepository);
const registrarOpcionServicioUseCase = new RegistrarOpcionServicioUseCase(opcionServicioRepository);
const actualizarOpcionServicioUseCase = new ActualizarOpcionServicioUseCase(opcionServicioRepository);
const eliminarOpcionServicioUseCase = new EliminarOpcionServicioUseCase(opcionServicioRepository);

export const opcionServicioController = new OpcionServicioController(
    obtenerOpcionServicioUseCase,
    obtenerOpcionesServicioUseCase,
    registrarOpcionServicioUseCase,
    actualizarOpcionServicioUseCase,
    eliminarOpcionServicioUseCase
);
