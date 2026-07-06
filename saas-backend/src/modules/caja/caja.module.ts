import { PrismaCajaRepository } from './infrastructure/prisma-caja.repository.js';
import prisma from '@infrastructure/config/prisma.js';
import { CajaController } from './presentation/caja.controller.js';
import { ObtenerCajaUseCase } from './application/obtener-caja.usecase.js';
import { ObtenerCajasUseCase } from './application/obtener-cajas.usecase.js';
import { RegistrarCajaUseCase } from './application/registrar-caja.usecase.js';
import { ActualizarCajaUseCase } from './application/actualizar-caja.usecase.js';
import { EliminarCajaUseCase } from './application/eliminar-caja.usecase.js';

const cajaRepository = new PrismaCajaRepository(prisma as any);

const obtenerCajaUseCase = new ObtenerCajaUseCase(cajaRepository);
const obtenerCajasUseCase = new ObtenerCajasUseCase(cajaRepository);
const registrarCajaUseCase = new RegistrarCajaUseCase(cajaRepository);
const actualizarCajaUseCase = new ActualizarCajaUseCase(cajaRepository);
const eliminarCajaUseCase = new EliminarCajaUseCase(cajaRepository);

export const cajaController = new CajaController(
    obtenerCajaUseCase,
    obtenerCajasUseCase,
    registrarCajaUseCase,
    actualizarCajaUseCase,
    eliminarCajaUseCase
);
