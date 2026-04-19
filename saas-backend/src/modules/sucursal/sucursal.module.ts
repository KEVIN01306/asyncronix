import { ActualizarSucursalUseCase } from "./application/actualizar-sucurrsal.usecase.js";
import { EliminarSucursalUseCase } from "./application/eliminar-sucursal.usecase.js";
import { ObtenerSucursalUseCase } from "./application/obtener-sucurrsal.usecase.js";
import { ObtenerSucursalesUseCase } from "./application/obtener-sucurrsales.usecase.js";
import { RegistrarSucursalUseCase } from "./application/registrar-sucurrsal.usecase.js";
import { PrismaSucursalRepository } from "./infrastructure/prisma-sucursal.repository.js";
import { SucursalController } from "./presentation/sucursal.controller.js";
import prisma from "@infrastructure/config/prisma.js";

const sucursalRepository = new PrismaSucursalRepository(prisma);

const obtenerSucursalUseCase = new ObtenerSucursalUseCase(sucursalRepository);
const obtenerSucursalesUseCase = new ObtenerSucursalesUseCase(sucursalRepository);
const registrarSucursalUseCase = new RegistrarSucursalUseCase(sucursalRepository);
const actualizarSucursalUseCase = new ActualizarSucursalUseCase(sucursalRepository);
const eliminarSucursalUseCase = new EliminarSucursalUseCase(sucursalRepository);

export const sucursalController = new SucursalController(
    obtenerSucursalUseCase,
    obtenerSucursalesUseCase,
    registrarSucursalUseCase,
    actualizarSucursalUseCase,
    eliminarSucursalUseCase
);
