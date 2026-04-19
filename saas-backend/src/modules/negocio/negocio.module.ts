import { PrismaNegocioRepository } from "./infrastructure/prisma-negocio.repository.js";
import { NegocioController } from "./presentation/negocio.controller.js";
import prisma from "@infrastructure/config/prisma.js";
import { ObtenerNegocioUseCase } from "./application/obtener-negocio.usecase.js";
import { ActualizarNegocioUseCase } from "./application/actualizar-negocio.usecase.js";
import { RegistrarNegocioUseCase } from "./application/registrar-negocio.usecase.js";

const negocioRepository = new PrismaNegocioRepository(prisma);

const registrarNegocioUseCase = new RegistrarNegocioUseCase(negocioRepository);
const actualizarNegocioUseCase = new ActualizarNegocioUseCase(negocioRepository);
const obtenerNegocioUseCase = new ObtenerNegocioUseCase(negocioRepository);

export const negocioController = new NegocioController(
    registrarNegocioUseCase,
    actualizarNegocioUseCase,
    obtenerNegocioUseCase
);
