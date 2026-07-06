import { ActualizarSucursalUseCase } from "./application/actualizar-sucurrsal.usecase.js";
import { EliminarSucursalUseCase } from "./application/eliminar-sucursal.usecase.js";
import { ObtenerSucursalUseCase } from "./application/obtener-sucurrsal.usecase.js";
import { ObtenerSucursalesUseCase } from "./application/obtener-sucurrsales.usecase.js";
import { RegistrarSucursalUseCase } from "./application/registrar-sucurrsal.usecase.js";
import { PrismaSucursalRepository } from "./infrastructure/prisma-sucursal.repository.js";
import { SucursalController } from "./presentation/sucursal.controller.js";
import prisma from "@infrastructure/config/prisma.js";

const sucursalRepository = new PrismaSucursalRepository(prisma);

import { ObtenerMiSucursalUseCase } from "./application/obtener-mi-sucursal.usecase.js";
import { AsignarCuentaBancariaSucursalUseCase } from "./application/asignar-cuenta-bancaria-sucursal.usecase.js";

const obtenerSucursalUseCase = new ObtenerSucursalUseCase(sucursalRepository);
const obtenerMiSucursalUseCase = new ObtenerMiSucursalUseCase(sucursalRepository);
const asignarCuentaBancariaSucursalUseCase = new AsignarCuentaBancariaSucursalUseCase(sucursalRepository);
const obtenerSucursalesUseCase = new ObtenerSucursalesUseCase(sucursalRepository);
const registrarSucursalUseCase = new RegistrarSucursalUseCase(sucursalRepository);
const actualizarSucursalUseCase = new ActualizarSucursalUseCase(sucursalRepository);
const eliminarSucursalUseCase = new EliminarSucursalUseCase(sucursalRepository);

export const sucursalController = new SucursalController(
    obtenerSucursalUseCase,
    obtenerMiSucursalUseCase,
    asignarCuentaBancariaSucursalUseCase,
    obtenerSucursalesUseCase,
    registrarSucursalUseCase,
    actualizarSucursalUseCase,
    eliminarSucursalUseCase
);
