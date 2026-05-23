import prisma from "@infrastructure/config/prisma.js";
import { PrismaModeloRepository } from "./infrastructure/prisma-modelo.repository.js";
import { ModeloController } from "./presentation/modelo.controller.js";
import { ObtenerModeloUseCase } from "./application/obtener-modelo.usecase.js";
import { ObtenerModelosUseCase } from "./application/obtener-modelos.usecase.js";

const modeloRepository = new PrismaModeloRepository(prisma);

const obtenerModelosUseCase = new ObtenerModelosUseCase(modeloRepository);
const obtenerModeloUseCase = new ObtenerModeloUseCase(modeloRepository);

export const modeloController = new ModeloController(obtenerModeloUseCase, obtenerModelosUseCase);
