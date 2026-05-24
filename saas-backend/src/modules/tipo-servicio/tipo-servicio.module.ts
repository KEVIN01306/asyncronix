import prisma from "@infrastructure/config/prisma.js";
import { ActualizarTipoServicioUseCase } from "./application/actualizar-tipo-servicio.usecase.js";
import { EliminarTipoServicioUseCase } from "./application/eliminar-tipo-servicio.usecase.js";
import { ObtenerTipoServicioUseCase } from "./application/obtener-tipo-servicio.usecase.js";
import { ObtenerTiposServicioUseCase } from "./application/obtener-tipos-servicio.usecase.js";
import { RegistrarTipoServicioUseCase } from "./application/registrar-tipo-servicio.usecase.js";
import { PrismaTipoServicioRepository } from "./infrastructure/prisma-tipo-servicio.repository.js";
import { TipoServicioController } from "./presentation/tipo-servicio.controller.js";

const tipoServicioRepository = new PrismaTipoServicioRepository(prisma);

const obtenerTiposServicioUseCase = new ObtenerTiposServicioUseCase(tipoServicioRepository);
const obtenerTipoServicioUseCase = new ObtenerTipoServicioUseCase(tipoServicioRepository);
const registrarTipoServicioUseCase = new RegistrarTipoServicioUseCase(tipoServicioRepository);
const actualizarTipoServicioUseCase = new ActualizarTipoServicioUseCase(tipoServicioRepository);
const eliminarTipoServicioUseCase = new EliminarTipoServicioUseCase(tipoServicioRepository);

export const tipoServicioController = new TipoServicioController(
    obtenerTipoServicioUseCase,
    obtenerTiposServicioUseCase,
    registrarTipoServicioUseCase,
    actualizarTipoServicioUseCase,
    eliminarTipoServicioUseCase
);
