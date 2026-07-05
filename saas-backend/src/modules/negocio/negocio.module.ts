import { PrismaNegocioRepository } from "./infrastructure/prisma-negocio.repository.js";
import { NegocioController } from "./presentation/negocio.controller.js";
import prisma from "@infrastructure/config/prisma.js";
import { ObtenerNegocioUseCase } from "./application/obtener-negocio.usecase.js";
import { ActualizarNegocioUseCase } from "./application/actualizar-negocio.usecase.js";
import { RegistrarNegocioUseCase } from "./application/registrar-negocio.usecase.js";
import { ObtenerMiNegocioUseCase } from "./application/obtener-mi-negocio.usecase.js";
import { ActualizarMiNegocioUseCase } from "./application/actualizar-mi-negocio.usecase.js";
import { CambiarMonedaNegocioUseCase } from "./application/cambiar-moneda-negocio.usecase.js";
import { PrismaMonedaRepository } from "../moneda/infrastructure/prisma-moneda.repository.js";

const negocioRepository = new PrismaNegocioRepository(prisma);
const monedaRepository = new PrismaMonedaRepository(prisma);

const registrarNegocioUseCase = new RegistrarNegocioUseCase(negocioRepository);
const actualizarNegocioUseCase = new ActualizarNegocioUseCase(negocioRepository);
const obtenerNegocioUseCase = new ObtenerNegocioUseCase(negocioRepository);
const obtenerMiNegocioUseCase = new ObtenerMiNegocioUseCase(negocioRepository);
const actualizarMiNegocioUseCase = new ActualizarMiNegocioUseCase(negocioRepository);
const cambiarMonedaNegocioUseCase = new CambiarMonedaNegocioUseCase(negocioRepository, monedaRepository);

export const negocioController = new NegocioController(
    registrarNegocioUseCase,
    actualizarNegocioUseCase,
    obtenerNegocioUseCase,
    obtenerMiNegocioUseCase,
    actualizarMiNegocioUseCase,
    cambiarMonedaNegocioUseCase
);
