import { PrismaTransaccionRepository } from './infrastructure/prisma-transaccion.repository.js';
import { TransaccionController } from './presentation/transaccion.controller.js';
import { CrearTransaccionUseCase } from './application/crear-transaccion.usecase.js';
import { CrearIngresoEgresoUseCase } from './application/crear-ingreso-egreso.usecase.js';
import { ObtenerDetalleIngresoEgresoUseCase } from './application/obtener-detalle-ingreso-egreso.usecase.js';
import { ListarIngresosEgresosUseCase } from './application/listar-ingresos-egresos.usecase.js';
import { PrismaCajaRepository } from '../caja/infrastructure/prisma-caja.repository.js';
import { PrismaCuentaBancariaRepository } from '../cuenta-bancaria/infrastructure/prisma-cuenta-bancaria.repository.js';
import { AcreditarCajaUseCase } from './application/acreditar-caja.usecase.js';
import { DebitarCajaUseCase } from './application/debitar-caja.usecase.js';
import { AcreditarCuentaBancariaUseCase } from './application/acreditar-cuenta-bancaria.usecase.js';
import { DebitarCuentaBancariaUseCase } from './application/debitar-cuenta-bancaria.usecase.js';
import prisma from '@infrastructure/config/prisma.js';
import { FrankfurterExchangeRateProvider } from '@shared/infrastructure/frankfurter.provider.js';

const transaccionRepository = new PrismaTransaccionRepository(prisma as any);
const cajaRepository = new PrismaCajaRepository(prisma as any);
const cuentaBancariaRepository = new PrismaCuentaBancariaRepository(prisma as any);
const exchangeRateProvider = new FrankfurterExchangeRateProvider();

const acreditarCajaUseCase = new AcreditarCajaUseCase(cajaRepository);
const debitarCajaUseCase = new DebitarCajaUseCase(cajaRepository);
const acreditarCuentaUseCase = new AcreditarCuentaBancariaUseCase(cuentaBancariaRepository);
const debitarCuentaUseCase = new DebitarCuentaBancariaUseCase(cuentaBancariaRepository);

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

// Generic transaction use case (for internal use by other modules)
export const crearTransaccionUseCase = new CrearTransaccionUseCase(transaccionRepository);

// Ingresos-Egresos use cases
const crearIngresoEgresoUseCase = new CrearIngresoEgresoUseCase(
    transaccionRepository,
    exchangeRateProvider,
    obtenerCaja,
    obtenerCuenta,
    obtenerNegocio,
    obtenerMoneda,
    acreditarCajaUseCase,
    debitarCajaUseCase,
    acreditarCuentaUseCase,
    debitarCuentaUseCase
);

const obtenerDetalleIngresoEgresoUseCase = new ObtenerDetalleIngresoEgresoUseCase(transaccionRepository);
const listarIngresosEgresosUseCase = new ListarIngresosEgresosUseCase(transaccionRepository);

export const transaccionController = new TransaccionController(
    crearIngresoEgresoUseCase,
    obtenerDetalleIngresoEgresoUseCase,
    listarIngresosEgresosUseCase
);
