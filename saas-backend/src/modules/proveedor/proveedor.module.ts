import { ActualizarProveedorUseCase } from "./application/actualizar-proveedor.usecase.js";
import { RegistrarProveedorUseCase } from "./application/crear.proveedor.usecase.js";
import { EliminarProveedorUseCase } from "./application/eliminar-proveedor.usecase.js";
import { ObtenerProveedorUseCase } from "./application/obetner-proveedorusecase.js";
import { ObtenerProveedoresUseCase } from "./application/obtener-proveedores.usecase.js";
import { PrismaProveedorRepository } from "./infrastructure/prisma-proveedor.repository.js";
import { ProveedorController } from "./presentation/proveedor.controller.js";
import prisma from "@infrastructure/config/prisma.js";

const proveedorRepository = new PrismaProveedorRepository(prisma);

const obtenerProveedorUseCase = new ObtenerProveedorUseCase(proveedorRepository);
const obtenerProveedoresUseCase = new ObtenerProveedoresUseCase(proveedorRepository);
const registrarProveedorUseCase = new RegistrarProveedorUseCase(proveedorRepository);
const actualizarProveedorUseCase = new ActualizarProveedorUseCase(proveedorRepository);
const eliminarProveedorUseCase = new EliminarProveedorUseCase(proveedorRepository);

export const proveedorController = new ProveedorController(
    obtenerProveedorUseCase,
    obtenerProveedoresUseCase,
    registrarProveedorUseCase,
    actualizarProveedorUseCase,
    eliminarProveedorUseCase
);
