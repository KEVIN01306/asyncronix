import prisma from "@infrastructure/config/prisma.js";
import { Argon2HashProvider } from "@shared/infrastructure/argon2-hash.provider.js";
import { PrismaModeloRepository } from "./infrastructure/prisma-modelo.repository.js";
import { ModeloController } from "./presentation/modelo.controller.js";
import { ObtenerModeloUseCase } from "./application/obtener-modelo.usecase.js";
import { ObtenerModelosUseCase } from "./application/obtener-modelos.usecase.js";
import { CrearModeloPorPinUseCase } from "./application/crear-modelo-por-pin.usecase.js";

const hashProvider = new Argon2HashProvider();
const modeloRepository = new PrismaModeloRepository(prisma);

const obtenerModelosUseCase = new ObtenerModelosUseCase(modeloRepository);
const obtenerModeloUseCase = new ObtenerModeloUseCase(modeloRepository);
const crearModeloPorPinUseCase = new CrearModeloPorPinUseCase(modeloRepository, prisma, hashProvider);

export const modeloController = new ModeloController(obtenerModeloUseCase, obtenerModelosUseCase, crearModeloPorPinUseCase);
