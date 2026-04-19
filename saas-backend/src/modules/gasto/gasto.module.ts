import { ActualizarGastoUseCase } from "./application/actualizar-gasto.usecase.js";
import { EliminarGastoUseCase } from "./application/eliminar-gasto.usecase.js";
import { ObtenerGastoUseCase } from "./application/obtener-gasto.usecase.js";
import { ObtenerGastosUseCase } from "./application/obtener-gastos.usecase.js";
import { RegistrarGastoUseCase } from "./application/registrar-gasto.usecase.js";
import { PrismaGastoRepository } from "./infrastructure/prisma-gasto.repository.js";
import { GastoController } from "./presentation/gasto.controller.js";
import prisma from "@infrastructure/config/prisma.js";

const gastoRepository = new PrismaGastoRepository(prisma);

const obtenerGastoUseCase = new ObtenerGastoUseCase(gastoRepository);
const obtenerGastosUseCase = new ObtenerGastosUseCase(gastoRepository);
const registrarGastoUseCase = new RegistrarGastoUseCase(gastoRepository);
const actualizarGastoUseCase = new ActualizarGastoUseCase(gastoRepository);
const eliminarGastoUseCase = new EliminarGastoUseCase(gastoRepository);

export const gastoController = new GastoController(
    obtenerGastoUseCase,
    obtenerGastosUseCase,
    registrarGastoUseCase,
    actualizarGastoUseCase,
    eliminarGastoUseCase
);
