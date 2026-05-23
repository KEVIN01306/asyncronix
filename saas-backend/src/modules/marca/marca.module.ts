import prisma from "@infrastructure/config/prisma.js";
import { PrismaMarcaRepository } from "./infrastructure/prisma-marca.repository.js";
import { MarcaController } from "./presentation/marca.controller.js";
import { ObtenerMarcaUseCase } from "./application/obtener-marca.usecase.js";
import { ObtenerMarcasUseCase } from "./application/obtener-marcas.usecase.js";

const marcaRepository = new PrismaMarcaRepository(prisma);

const obtenerMarcasUseCase = new ObtenerMarcasUseCase(marcaRepository);
const obtenerMarcaUseCase = new ObtenerMarcaUseCase(marcaRepository);

export const marcaController = new MarcaController(obtenerMarcaUseCase, obtenerMarcasUseCase);
