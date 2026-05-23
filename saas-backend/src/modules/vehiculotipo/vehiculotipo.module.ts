import prisma from "@infrastructure/config/prisma.js";
import { PrismaVehiculoTipoRepository } from "./infrastructure/prisma-vehiculotipo.repository.js";
import { VehiculoTipoController } from "./presentation/vehiculotipo.controller.js";
import { ObtenerVehiculoTiposUseCase } from "./application/obtener-vehiculotipos.usecase.js";

const repository = new PrismaVehiculoTipoRepository(prisma);
const obtenerVehiculoTiposUseCase = new ObtenerVehiculoTiposUseCase(repository);

export const vehiculotipoController = new VehiculoTipoController(obtenerVehiculoTiposUseCase);
