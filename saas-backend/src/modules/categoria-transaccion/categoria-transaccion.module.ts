import prisma from '@infrastructure/config/prisma.js';
import { PrismaCategoriaTransaccionRepository } from './infrastructure/prisma-categoria-transaccion.repository.js';
import { CategoriaTransaccionController } from './presentation/categoria-transaccion.controller.js';
import { ObtenerCategoriaTransaccionUseCase } from './application/obtener-categoria-transaccion.usecase.js';
import { ObtenerCategoriasTransaccionUseCase } from './application/obtener-categorias-transaccion.usecase.js';
import { RegistrarCategoriaTransaccionUseCase } from './application/registrar-categoria-transaccion.usecase.js';
import { ActualizarCategoriaTransaccionUseCase } from './application/actualizar-categoria-transaccion.usecase.js';
import { EliminarCategoriaTransaccionUseCase } from './application/eliminar-categoria-transaccion.usecase.js';

const categoriaTransaccionRepository = new PrismaCategoriaTransaccionRepository(prisma as any);
const obtenerCategoriaTransaccionUseCase = new ObtenerCategoriaTransaccionUseCase(categoriaTransaccionRepository);
const obtenerCategoriasTransaccionUseCase = new ObtenerCategoriasTransaccionUseCase(categoriaTransaccionRepository);
const registrarCategoriaTransaccionUseCase = new RegistrarCategoriaTransaccionUseCase(categoriaTransaccionRepository);
const actualizarCategoriaTransaccionUseCase = new ActualizarCategoriaTransaccionUseCase(categoriaTransaccionRepository);
const eliminarCategoriaTransaccionUseCase = new EliminarCategoriaTransaccionUseCase(categoriaTransaccionRepository);

export const categoriaTransaccionController = new CategoriaTransaccionController(
  obtenerCategoriaTransaccionUseCase,
  obtenerCategoriasTransaccionUseCase,
  registrarCategoriaTransaccionUseCase,
  actualizarCategoriaTransaccionUseCase,
  eliminarCategoriaTransaccionUseCase
);
