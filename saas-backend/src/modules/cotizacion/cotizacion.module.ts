import { CotizacionController } from './presentation/cotizacion.controller.js';
import { CotizacionMapper } from './infrastructure/mappers/cotizacion.mapper.js';
import { PrismaCotizacionRepository } from './infrastructure/prisma-cotizacion.repository.js';
import { CrearCotizacionUseCase } from './application/crear-cotizacion.usecase.js';
import { ObtenerCotizacionesUseCase } from './application/obtener-cotizaciones.usecase.js';
import { ObtenerCotizacionUseCase } from './application/obtener-cotizacion.usecase.js';
import { ActualizarEstadoCotizacionUseCase } from './application/actualizar-estado-cotizacion.usecase.js';
import { ConvertirCotizacionUseCase } from './application/convertir-cotizacion.usecase.js';
import { PrismaTransactionManager } from '@shared/database/prisma/PrismaTransactionManager.js';
import prisma from '@infrastructure/config/prisma.js';

import { registrarVentaUseCase, finalizarVentaUseCase, crearPreVentaUseCase } from '../ventas/venta.module.js';
import { registrarServicioUseCase, crearServicioRepuestoUseCase } from '../servicioVehiculo/servicio.module.js';
import { varianteRepository } from '../producto/producto.module.js';

const cotizacionRepository = new PrismaCotizacionRepository(prisma as any);
const transactionManager = new PrismaTransactionManager(prisma as any);

// Casos de uso
const crearCotizacionUseCase = new CrearCotizacionUseCase(cotizacionRepository);
const obtenerCotizacionesUseCase = new ObtenerCotizacionesUseCase(cotizacionRepository);
const obtenerCotizacionUseCase = new ObtenerCotizacionUseCase(cotizacionRepository);
const actualizarEstadoCotizacionUseCase = new ActualizarEstadoCotizacionUseCase(cotizacionRepository);
const convertirCotizacionUseCase = new ConvertirCotizacionUseCase(
    cotizacionRepository,
    transactionManager,
    registrarVentaUseCase,
    finalizarVentaUseCase,
    crearPreVentaUseCase,
    registrarServicioUseCase,
    varianteRepository,
    crearServicioRepuestoUseCase
);

export const cotizacionController = new CotizacionController(
    crearCotizacionUseCase,
    obtenerCotizacionesUseCase,
    obtenerCotizacionUseCase,
    actualizarEstadoCotizacionUseCase,
    convertirCotizacionUseCase
);
