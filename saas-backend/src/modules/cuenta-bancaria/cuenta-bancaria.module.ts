import { CuentaBancariaController } from './presentation/cuenta-bancaria.controller.js';
import { CuentaBancariaMapper } from './infrastructure/mappers/cuenta-bancaria.mapper.js';
import { PrismaCuentaBancariaRepository } from './infrastructure/prisma-cuenta-bancaria.repository.js';
import { ObtenerCuentaBancariaUseCase } from './application/obtener-cuenta-bancaria.usecase.js';
import { ObtenerCuentasBancariasUseCase } from './application/obtener-cuentas-bancarias.usecase.js';
import { RegistrarCuentaBancariaUseCase } from './application/registrar-cuenta-bancaria.usecase.js';
import { ActualizarCuentaBancariaUseCase } from './application/actualizar-cuenta-bancaria.usecase.js';
import { EliminarCuentaBancariaUseCase } from './application/eliminar-cuenta-bancaria.usecase.js';
import { ListarHistorialCuentaBancariaUseCase } from './application/listar-historial-cuenta-bancaria.usecase.js';
import { PrismaTransaccionRepository } from '../transaccion/infrastructure/prisma-transaccion.repository.js';
import prisma from '@infrastructure/config/prisma.js';

const cuentaBancariaMapper = new CuentaBancariaMapper();
const cuentaBancariaRepository = new PrismaCuentaBancariaRepository(prisma as any);
const transaccionRepository = new PrismaTransaccionRepository(prisma as any);
const obtenerCuentaBancariaUseCase = new ObtenerCuentaBancariaUseCase(cuentaBancariaRepository);
const obtenerCuentasBancariasUseCase = new ObtenerCuentasBancariasUseCase(cuentaBancariaRepository);
import { validarLimiteNegocioUseCase } from '../negocio/negocio.module.js';
const registrarCuentaBancariaUseCase = new RegistrarCuentaBancariaUseCase(cuentaBancariaRepository, validarLimiteNegocioUseCase);
const actualizarCuentaBancariaUseCase = new ActualizarCuentaBancariaUseCase(cuentaBancariaRepository);
const eliminarCuentaBancariaUseCase = new EliminarCuentaBancariaUseCase(cuentaBancariaRepository);
const listarHistorialCuentaBancariaUseCase = new ListarHistorialCuentaBancariaUseCase(transaccionRepository);

export const cuentaBancariaController = new CuentaBancariaController(
    obtenerCuentaBancariaUseCase,
    obtenerCuentasBancariasUseCase,
    registrarCuentaBancariaUseCase,
    actualizarCuentaBancariaUseCase,
    eliminarCuentaBancariaUseCase,
    listarHistorialCuentaBancariaUseCase
);
