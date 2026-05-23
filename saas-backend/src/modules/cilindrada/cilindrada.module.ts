import prisma from "@infrastructure/config/prisma.js";
import { PrismaCilindradaRepository } from "./infrastructure/prisma-cilindrada.repository.js";
import { CilindradaController } from "./presentation/cilindrada.controller.js";
import { ObtenerCilindradaUseCase } from "./application/obtener-cilindrada.usecase.js";
import { ObtenerCilindradasUseCase } from "./application/obtener-cilindradas.usecase.js";

const cilindradaRepository = new PrismaCilindradaRepository(prisma);

const obtenerCilindradasUseCase = new ObtenerCilindradasUseCase(cilindradaRepository);
const obtenerCilindradaUseCase = new ObtenerCilindradaUseCase(cilindradaRepository);

export const cilindradaController = new CilindradaController(obtenerCilindradaUseCase, obtenerCilindradasUseCase);
