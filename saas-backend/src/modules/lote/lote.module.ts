import prisma from '@infrastructure/config/prisma.js';
import { PrismaLoteRepository } from './infrastructure/prisma-lote.repository.js';
import { RegistrarLoteUseCase } from './application/registrar-lote.usecase.js';
import { ObtenerLotesUseCase } from './application/obtener-lotes.usecase.js';
import { ObtenerLoteUseCase } from './application/obtener-lote.usecase.js';
import { ListarLotesUseCase } from './application/listar-lotes.usecase.js';
import { ListarLotesPorProductoUseCase } from './application/listar-lotes-por-producto.usecase.js';
import { RegularizarStockNegativoUseCase } from './application/regularizar-stock-negativo.usecase.js';
import { LoteController } from './presentation/lote.controller.js';

import { DescontarStockUseCase } from './application/descontar-stock.usecase.js';
import { IncrementarStockUseCase, DevolverStockUseCase } from './application/incrementar-stock.usecase.js';
import { descontarStock, incrementarStock, devolverStock } from './application/services/stock-movement.service.js';

const repo = new PrismaLoteRepository(prisma);
const regularizarStockNegativo = new RegularizarStockNegativoUseCase();
const registrar = new RegistrarLoteUseCase(repo, prisma, regularizarStockNegativo);
const obtener = new ObtenerLoteUseCase(repo);
const obtenerPorProducto = new ObtenerLotesUseCase(repo);
const listar = new ListarLotesUseCase(repo);
const listarPorProducto = new ListarLotesPorProductoUseCase(repo);

export const descontarStockUseCase = new DescontarStockUseCase(prisma);
export const incrementarStockUseCase = new IncrementarStockUseCase(prisma);
export const devolverStockUseCase = incrementarStockUseCase;

export { descontarStock, incrementarStock, devolverStock, DescontarStockUseCase, IncrementarStockUseCase, DevolverStockUseCase };

export const loteController = new LoteController(registrar, obtener, obtenerPorProducto, listar, listarPorProducto);
