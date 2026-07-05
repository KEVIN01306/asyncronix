import prisma from "@infrastructure/config/prisma.js";
import { PrismaPaisRepository } from "./infrastructure/prisma-pais.repository.js";
import { PaisController } from "./presentation/pais.controller.js";
import { ObtenerPaisUseCase } from "./application/obtener-pais.usecase.js";
import { ObtenerPaisesUseCase } from "./application/obtener-paises.usecase.js";

const paisRepository = new PrismaPaisRepository(prisma);

const obtenerPaisesUseCase = new ObtenerPaisesUseCase(paisRepository);
const obtenerPaisUseCase = new ObtenerPaisUseCase(paisRepository);

export const paisController = new PaisController(obtenerPaisUseCase, obtenerPaisesUseCase);
