import prisma from '@infrastructure/config/prisma.js';
import { PrismaLoteRepository } from './infrastructure/prisma-lote.repository.js';
import { RegistrarLoteUseCase } from './application/registrar-lote.usecase.js';
import { ObtenerLotesUseCase } from './application/obtener-lotes.usecase.js';
import { ObtenerLoteUseCase } from './application/obtener-lote.usecase.js';
import { ListarLotesUseCase } from './application/listar-lotes.usecase.js';
import { LoteController } from './presentation/lote.controller.js';

const repo = new PrismaLoteRepository(prisma);
const registrar = new RegistrarLoteUseCase(repo);
const obtener = new ObtenerLoteUseCase(repo);
const obtenerPorProducto = new ObtenerLotesUseCase(repo);
const listar = new ListarLotesUseCase(repo);

export const loteController = new LoteController(registrar, obtener, obtenerPorProducto, listar);
