import prisma from "@infrastructure/config/prisma.js";
import { PrismaMonedaRepository } from "./infrastructure/prisma-moneda.repository.js";
import { MonedaController } from "./presentation/moneda.controller.js";
import { ObtenerMonedaUseCase } from "./application/obtener-moneda.usecase.js";
import { ObtenerMonedasUseCase } from "./application/obtener-monedas.usecase.js";

const monedaRepository = new PrismaMonedaRepository(prisma);

const obtenerMonedasUseCase = new ObtenerMonedasUseCase(monedaRepository);
const obtenerMonedaUseCase = new ObtenerMonedaUseCase(monedaRepository);

export const monedaController = new MonedaController(obtenerMonedaUseCase, obtenerMonedasUseCase);
