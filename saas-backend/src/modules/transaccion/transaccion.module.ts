import { PrismaTransaccionRepository } from './infrastructure/prisma-transaccion.repository.js';
import { TransaccionController } from './presentation/transaccion.controller.js';
import { CrearMovimientoUseCase } from './application/crear-movimiento.usecase.js';
import { ObtenerDetalleMovimientoUseCase } from './application/obtener-detalle-movimiento.usecase.js';
import { ListarMovimientosUseCase } from './application/listar-movimientos.usecase.js';
import prisma from '@infrastructure/config/prisma.js';
import { FrankfurterExchangeRateProvider } from '@shared/infrastructure/frankfurter.provider.js';

const transaccionRepository = new PrismaTransaccionRepository(prisma as any);
const exchangeRateProvider = new FrankfurterExchangeRateProvider();

// Helper functions for getting data
const obtenerCaja = async (id: string) => {
    return await (prisma as any).caja.findUnique({
        where: { id },
        select: { id: true },
    });
};

const obtenerCuenta = async (id: string) => {
    return await (prisma as any).cuentaBancaria.findUnique({
        where: { id },
        select: { id: true, moneda_id: true },
    });
};

const obtenerNegocio = async (id: string) => {
    return await (prisma as any).negocio.findUnique({
        where: { id },
        select: { moneda_id: true },
    });
};

const obtenerMoneda = async (id: string) => {
    return await (prisma as any).moneda.findUnique({
        where: { id },
        select: { codigo: true },
    });
};

const crearMovimientoUseCase = new CrearMovimientoUseCase(
    transaccionRepository,
    exchangeRateProvider,
    obtenerCaja,
    obtenerCuenta,
    obtenerNegocio,
    obtenerMoneda
);

const obtenerDetalleMovimientoUseCase = new ObtenerDetalleMovimientoUseCase(transaccionRepository);
const listarMovimientosUseCase = new ListarMovimientosUseCase(transaccionRepository);

export const transaccionController = new TransaccionController(
    crearMovimientoUseCase,
    obtenerDetalleMovimientoUseCase,
    listarMovimientosUseCase
);
