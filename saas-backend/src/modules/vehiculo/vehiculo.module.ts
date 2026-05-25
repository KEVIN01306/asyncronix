import prisma from '@infrastructure/config/prisma.js';
import { PrismaVehiculoRepository } from './infrastructure/prisma-vehiculo.repository.js';
import { ObtenerVehiculosUseCase } from './application/obtener-vehiculos.usecase.js';
import { ObtenerVehiculoUseCase } from './application/obtener-vehiculo.usecase.js';
import { ObtenerVehiculoPorPlacaUseCase } from './application/obtener-vehiculo-por-placa.usecase.js';
import { RegistrarVehiculoUseCase } from './application/registrar-vehiculo.usecase.js';
import { ActualizarVehiculoUseCase } from './application/actualizar-vehiculo.usecase.js';
import { SubirAvatarVehiculoUseCase } from './application/subir-avatar.usecase.js';
import { SubirCalcomaniaVehiculoUseCase } from './application/subir-calcomania.usecase.js';
import { VehiculoController } from './presentation/vehiculo.controller.js';
import { PrismaClienteRepository } from '../cliente/infrastructure/prisma-cliente.repository.js';
import { AsociarClienteVehiculoUseCase } from './application/asociar-cliente.usecase.js';
import { CrearYAsociarClienteUseCase } from './application/crear-y-asociar-cliente.usecase.js';

const repository = new PrismaVehiculoRepository(prisma as any);
const obtenerVehiculosUseCase = new ObtenerVehiculosUseCase(repository);
const obtenerVehiculoUseCase = new ObtenerVehiculoUseCase(repository);
const obtenerVehiculoPorPlacaUseCase = new ObtenerVehiculoPorPlacaUseCase(repository);
const registrarVehiculoUseCase = new RegistrarVehiculoUseCase(repository);
const actualizarVehiculoUseCase = new ActualizarVehiculoUseCase(repository);
const subirAvatarUseCase = new SubirAvatarVehiculoUseCase(repository);
const subirCalcomaniaUseCase = new SubirCalcomaniaVehiculoUseCase(repository);
const clienteRepository = new PrismaClienteRepository(prisma as any);
const asociarClienteUseCase = new AsociarClienteVehiculoUseCase(repository, clienteRepository);
const crearYAsociarClienteUseCase = new CrearYAsociarClienteUseCase(clienteRepository, repository);

export const vehiculoController = new VehiculoController(
    obtenerVehiculosUseCase,
    obtenerVehiculoUseCase,
    obtenerVehiculoPorPlacaUseCase,
    registrarVehiculoUseCase,
    actualizarVehiculoUseCase,
    subirAvatarUseCase,
    subirCalcomaniaUseCase,
    asociarClienteUseCase,
    crearYAsociarClienteUseCase
);
