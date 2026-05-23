import prisma from "@infrastructure/config/prisma.js";
import { PrismaLineaRepository } from "./infrastructure/prisma-linea.repository.js";
import { LineaController } from "./presentation/linea.controller.js";
import { ObtenerLineaUseCase } from "./application/obtener-linea.usecase.js";
import { ObtenerLineasUseCase } from "./application/obtener-lineas.usecase.js";

const lineaRepository = new PrismaLineaRepository(prisma);

const obtenerLineasUseCase = new ObtenerLineasUseCase(lineaRepository);
const obtenerLineaUseCase = new ObtenerLineaUseCase(lineaRepository);

export const lineaController = new LineaController(obtenerLineaUseCase, obtenerLineasUseCase);
