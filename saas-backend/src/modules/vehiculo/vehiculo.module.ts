import prisma from '@infrastructure/config/prisma.js';
import { PrismaVehiculoRepository } from './infrastructure/prisma-vehiculo.repository.js';
import { ObtenerVehiculosUseCase } from './application/obtener-vehiculos.usecase.js';
import { ObtenerVehiculoUseCase } from './application/obtener-vehiculo.usecase.js';
import { RegistrarVehiculoUseCase } from './application/registrar-vehiculo.usecase.js';
import { ActualizarVehiculoUseCase } from './application/actualizar-vehiculo.usecase.js';
import { SubirAvatarVehiculoUseCase } from './application/subir-avatar.usecase.js';
import { SubirCalcomaniaVehiculoUseCase } from './application/subir-calcomania.usecase.js';
import { VehiculoController } from './presentation/vehiculo.controller.js';

const repository = new PrismaVehiculoRepository(prisma as any);
const obtenerVehiculosUseCase = new ObtenerVehiculosUseCase(repository);
const obtenerVehiculoUseCase = new ObtenerVehiculoUseCase(repository);
const registrarVehiculoUseCase = new RegistrarVehiculoUseCase(repository);
const actualizarVehiculoUseCase = new ActualizarVehiculoUseCase(repository);
const subirAvatarUseCase = new SubirAvatarVehiculoUseCase(repository);
const subirCalcomaniaUseCase = new SubirCalcomaniaVehiculoUseCase(repository);

export const vehiculoController = new VehiculoController(
    obtenerVehiculosUseCase,
    obtenerVehiculoUseCase,
    registrarVehiculoUseCase,
    actualizarVehiculoUseCase,
    subirAvatarUseCase,
    subirCalcomaniaUseCase
);
