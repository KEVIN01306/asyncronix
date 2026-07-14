import { PrismaClient } from '@prisma/client';
import { PrismaReporteRepository } from './infrastructure/repositories/prisma-reporte.repository.js';
import { ObtenerReporteFinancieroUseCase } from './application/use-cases/obtener-reporte-financiero.usecase.js';
import { ReporteController } from './presentation/reporte.controller.js';

import { FrankfurterExchangeRateProvider } from '@shared/infrastructure/frankfurter.provider.js';
import { PrismaNegocioRepository } from '../negocio/infrastructure/prisma-negocio.repository.js';

const prisma = new PrismaClient();
const repository = new PrismaReporteRepository(prisma);
const negocioRepository = new PrismaNegocioRepository(prisma);
const exchangeRateProvider = new FrankfurterExchangeRateProvider();

const obtenerReporteUseCase = new ObtenerReporteFinancieroUseCase(
    repository,
    negocioRepository,
    exchangeRateProvider
);

export const reporteController = new ReporteController(obtenerReporteUseCase);
