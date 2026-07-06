import prisma from "@infrastructure/config/prisma.js";
import { PrismaBancoRepository } from "./infrastructure/prisma-banco.repository.js";
import { BancoController } from "./presentation/banco.controller.js";
import { ObtenerBancoUseCase } from "./application/obtener-banco.usecase.js";
import { ObtenerBancosUseCase } from "./application/obtener-bancos.usecase.js";

const bancoRepository = new PrismaBancoRepository(prisma);
const obtenerBancosUseCase = new ObtenerBancosUseCase(bancoRepository);
const obtenerBancoUseCase = new ObtenerBancoUseCase(bancoRepository);

export const bancoController = new BancoController(obtenerBancosUseCase, obtenerBancoUseCase);
