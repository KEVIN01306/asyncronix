import { PrismaProveedorRepository } from './infrastructure/prisma-proveedor.repository.js';
import { ProveedorController } from './presentation/proveedor.controller.js';
import prisma from '@infrastructure/config/prisma.js';
import { ObtenerProveedorUseCase } from './application/obtener-proveedor.usecase.js';
import { ObtenerProveedoresUseCase } from './application/obtener-proveedores.usecase.js';
import { RegistrarProveedorUseCase } from './application/registrar-proveedor.usecase.js';
import { ActualizarProveedorUseCase } from './application/actualizar-proveedor.usecase.js';
import { EliminarProveedorUseCase } from './application/eliminar-proveedor.usecase.js';

const repo = new PrismaProveedorRepository(prisma as any);

const obtenerProveedoresUc = new ObtenerProveedoresUseCase(repo);
const obtenerProveedorUc = new ObtenerProveedorUseCase(repo);
const registrarProveedorUc = new RegistrarProveedorUseCase(repo);
const actualizarProveedorUc = new ActualizarProveedorUseCase(repo);
const eliminarProveedorUc = new EliminarProveedorUseCase(repo);

export const proveedorController = new ProveedorController(
    obtenerProveedorUc,
    obtenerProveedoresUc,
    registrarProveedorUc,
    actualizarProveedorUc,
    eliminarProveedorUc
);

