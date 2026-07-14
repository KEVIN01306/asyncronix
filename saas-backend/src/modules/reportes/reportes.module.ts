import { PrismaClient } from '@prisma/client';
import { PrismaReporteRepository } from './infrastructure/repositories/prisma-reporte.repository.js';
import { ObtenerReporteFinancieroUseCase } from './application/use-cases/obtener-reporte-financiero.usecase.js';
import { ReporteController } from './presentation/reporte.controller.js';

const prisma = new PrismaClient();
const repository = new PrismaReporteRepository(prisma);

const obtenerReporteUseCase = new ObtenerReporteFinancieroUseCase(
    repository
);

export const reporteController = new ReporteController(obtenerReporteUseCase);
