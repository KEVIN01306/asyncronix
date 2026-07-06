import { PrismaCajaRepository } from './infrastructure/prisma-caja.repository.js';
import prisma from '@infrastructure/config/prisma.js';
import { CajaController } from './presentation/caja.controller.js';
import { ObtenerCajaUseCase } from './application/obtener-caja.usecase.js';
import { ObtenerCajasUseCase } from './application/obtener-cajas.usecase.js';
import { RegistrarCajaUseCase } from './application/registrar-caja.usecase.js';
import { ActualizarCajaUseCase } from './application/actualizar-caja.usecase.js';
import { EliminarCajaUseCase } from './application/eliminar-caja.usecase.js';
import { AsociarDispositivoCajaUseCase } from './application/asociar-dispositivo-caja.usecase.js';
import { DesasociarDispositivoCajaUseCase } from './application/desasociar-dispositivo-caja.usecase.js';
import { PrismaUsuarioRepository } from '../usuarios/infrastructure/prisma-usuario.repository.js';
import { Argon2HashProvider } from '@shared/infrastructure/argon2-hash.provider.js';

const cajaRepository = new PrismaCajaRepository(prisma as any);
const usuarioRepository = new PrismaUsuarioRepository(prisma as any);
const hashProvider = new Argon2HashProvider();

const obtenerCajaUseCase = new ObtenerCajaUseCase(cajaRepository);
const obtenerCajasUseCase = new ObtenerCajasUseCase(cajaRepository);
const registrarCajaUseCase = new RegistrarCajaUseCase(cajaRepository);
const actualizarCajaUseCase = new ActualizarCajaUseCase(cajaRepository);
const eliminarCajaUseCase = new EliminarCajaUseCase(cajaRepository);
const asociarDispositivoCajaUseCase = new AsociarDispositivoCajaUseCase(cajaRepository, usuarioRepository, hashProvider);
const desasociarDispositivoCajaUseCase = new DesasociarDispositivoCajaUseCase(cajaRepository);

export const cajaController = new CajaController(
    obtenerCajaUseCase,
    obtenerCajasUseCase,
    registrarCajaUseCase,
    actualizarCajaUseCase,
    eliminarCajaUseCase,
    asociarDispositivoCajaUseCase,
    desasociarDispositivoCajaUseCase
);
