import { PrismaVentaRepository } from "./infrastructure/prisma-venta.repository.js";
import { RegistrarVentaUseCase } from "./application/registrar-venta.usecase.js";
import { ActualizarVentaUseCase } from "./application/actualizar-venta.usecase.js";
import { AnularVentaUseCase } from "./application/anular-venta.usecase.js";
import { ObtenerVentaUseCase } from "./application/obtener-venta.usecase.js";
import { ObtenerVentasUseCase } from "./application/obtener-ventas.usecase.js";
import { AgregarProductoUseCase } from "./application/agregar-producto.usecase.js";
import { BuscarProductoPorCodigoUseCase } from "./application/buscar-producto-por-sku.usecase.js";
import { EliminarDetalleVentaUseCase } from "./application/eliminar-detalle-venta.usecase.js";
import { FinalizarVentaUseCase } from "./application/finalizar-venta.usecase.js";
import { BuscarClientePorNitVentaUseCase } from "./application/buscar-cliente-por-nit.usecase.js";
import { RegistrarClienteParaVentaUseCase } from "./application/registrar-cliente-para-venta.usecase.js";
import { VentaController } from "./presentation/venta.controller.js";
import prisma from "@infrastructure/config/prisma.js";
import { PrismaLoteRepository } from "../lote/infrastructure/prisma-lote.repository.js";
import { PrismaVarianteRepository } from "../producto/infrastructure/prisma-variante.repository.js";
import { PrismaClienteRepository } from "../cliente/infrastructure/prisma-cliente.repository.js";
import { Argon2HashProvider } from "../../shared/infrastructure/argon2-hash.provider.js";
import { CrearPreVentaUseCase } from "./application/crear-preventa.usecase.js";
import { ObtenerPreVentasUseCase } from "./application/obtener-preventas.usecase.js";
import { ObtenerPreVentaUseCase } from "./application/obtener-preventa.usecase.js";
import { ActualizarCantidadPreVentaUseCase } from "./application/actualizar-cantidad-preventa.usecase.js";
import { FinalizarPreVentaUseCase } from "./application/finalizar-preventa.usecase.js";
import { ValidarPinCajaUseCase } from "./application/validar-pin.usecase.js";
import { AgregarDetallePreVentaUseCase } from "./application/agregar-detalle-preventa.usecase.js";
import { ActualizarClientePreVentaUseCase } from "./application/actualizar-cliente-preventa.usecase.js";
import { EliminarDetallePreVentaUseCase } from "./application/eliminar-detalle-preventa.usecase.js";
import { PrismaTransactionManager } from "../../shared/database/prisma/PrismaTransactionManager.js";
import { PrismaSucursalRepository } from "../sucursal/infrastructure/prisma-sucursal.repository.js";
import { PrismaCajaRepository } from "../caja/infrastructure/prisma-caja.repository.js";
import { PrismaCuentaBancariaRepository } from "../cuenta-bancaria/infrastructure/prisma-cuenta-bancaria.repository.js";
import { PrismaTransaccionRepository } from "../transaccion/infrastructure/prisma-transaccion.repository.js";
import { AcreditarCajaUseCase } from "../transaccion/application/acreditar-caja.usecase.js";
import { AcreditarCuentaBancariaUseCase } from "../transaccion/application/acreditar-cuenta-bancaria.usecase.js";
import { CrearTransaccionUseCase } from "../transaccion/application/crear-transaccion.usecase.js";
import { FrankfurterExchangeRateProvider } from "../../shared/infrastructure/frankfurter.provider.js";

const ventaRepository = new PrismaVentaRepository(prisma);
const loteRepository = new PrismaLoteRepository(prisma);
const varianteRepository = new PrismaVarianteRepository(prisma);
const clienteRepository = new PrismaClienteRepository(prisma);

const transactionManager = new PrismaTransactionManager(prisma);
const sucursalRepository = new PrismaSucursalRepository(prisma);
const cajaRepository = new PrismaCajaRepository(prisma);
const cuentaBancariaRepository = new PrismaCuentaBancariaRepository(prisma);
const transaccionRepository = new PrismaTransaccionRepository(prisma);

const acreditarCajaUseCase = new AcreditarCajaUseCase(cajaRepository);
const acreditarCuentaBancariaUseCase = new AcreditarCuentaBancariaUseCase(cuentaBancariaRepository);
const crearTransaccionUseCase = new CrearTransaccionUseCase(transaccionRepository);

export const registrarVentaUseCase = new RegistrarVentaUseCase(ventaRepository, loteRepository, varianteRepository);
const agregarProductoUseCase = new AgregarProductoUseCase(ventaRepository, loteRepository, varianteRepository);
const buscarProductoPorCodigoUseCase = new BuscarProductoPorCodigoUseCase(varianteRepository);
const eliminarDetalleVentaUseCase = new EliminarDetalleVentaUseCase(ventaRepository);
export const finalizarVentaUseCase = new FinalizarVentaUseCase(
    ventaRepository,
    transactionManager,
    sucursalRepository,
    acreditarCajaUseCase,
    acreditarCuentaBancariaUseCase,
    crearTransaccionUseCase,
    new FrankfurterExchangeRateProvider()
);
import { DigifactProvider } from "../../shared/infrastructure/providers/digifact/digifact.provider.js";
import { PrismaFacturaRepository } from "../facturacion/infrastructure/repositories/prisma-factura.repository.js";
import { ObtenerTokenDigifactUseCase } from "../facturacion/application/use-cases/obtener-token-digifact.usecase.js";

const digifactProvider = new DigifactProvider();
const facturaRepository = new PrismaFacturaRepository(prisma);
const obtenerTokenDigifactUseCase = new ObtenerTokenDigifactUseCase(facturaRepository, digifactProvider);

const actualizarVentaUseCase = new ActualizarVentaUseCase(ventaRepository);
const anularVentaUseCase = new AnularVentaUseCase(
    ventaRepository,
    facturaRepository,
    anularFacturaUseCase
);
const obtenerVentaUseCase = new ObtenerVentaUseCase(ventaRepository);
const obtenerVentasUseCase = new ObtenerVentasUseCase(ventaRepository);
const buscarClientePorNitVentaUseCase = new BuscarClientePorNitVentaUseCase(clienteRepository);
const registrarClienteParaVentaUseCase = new RegistrarClienteParaVentaUseCase(clienteRepository);
export const crearPreVentaUseCase = new CrearPreVentaUseCase(prisma);
const obtenerPreVentasUseCase = new ObtenerPreVentasUseCase(prisma);
const obtenerPreVentaUseCase = new ObtenerPreVentaUseCase(prisma);
const actualizarCantidadPreVentaUseCase = new ActualizarCantidadPreVentaUseCase(prisma);
const hashProvider = new Argon2HashProvider();
import { crearYCertificarFacturaUseCase, anularFacturaUseCase } from "../facturacion/module.js";
const finalizarPreVentaUseCase = new FinalizarPreVentaUseCase(
    prisma,
    hashProvider,
    sucursalRepository,
    acreditarCajaUseCase,
    acreditarCuentaBancariaUseCase,
    crearTransaccionUseCase,
    new FrankfurterExchangeRateProvider(),
    crearYCertificarFacturaUseCase
);
const validarPinCajaUseCase = new ValidarPinCajaUseCase(prisma, hashProvider);
const agregarDetallePreVentaUseCase = new AgregarDetallePreVentaUseCase(prisma);
const actualizarClientePreVentaUseCase = new ActualizarClientePreVentaUseCase(prisma);
const eliminarDetallePreVentaUseCase = new EliminarDetallePreVentaUseCase(prisma);


export const ventaController = new VentaController(
    registrarVentaUseCase,
    actualizarVentaUseCase,
    anularVentaUseCase,
    obtenerVentaUseCase,
    obtenerVentasUseCase,
    agregarProductoUseCase,
    buscarProductoPorCodigoUseCase,
    eliminarDetalleVentaUseCase,
    finalizarVentaUseCase,
    buscarClientePorNitVentaUseCase,
    registrarClienteParaVentaUseCase,
    crearPreVentaUseCase,
    obtenerPreVentasUseCase,
    obtenerPreVentaUseCase,
    actualizarCantidadPreVentaUseCase,
    finalizarPreVentaUseCase,
    validarPinCajaUseCase,
    agregarDetallePreVentaUseCase,
    actualizarClientePreVentaUseCase,
    eliminarDetallePreVentaUseCase
);
