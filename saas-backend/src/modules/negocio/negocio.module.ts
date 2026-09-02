import { PrismaNegocioRepository } from "./infrastructure/prisma-negocio.repository.js";
import { NegocioController } from "./presentation/negocio.controller.js";
import prisma from "@infrastructure/config/prisma.js";
import { ObtenerNegocioUseCase } from "./application/obtener-negocio.usecase.js";
import { ActualizarNegocioUseCase } from "./application/actualizar-negocio.usecase.js";
import { RegistrarNegocioUseCase } from "./application/registrar-negocio.usecase.js";
import { ObtenerMiNegocioUseCase } from "./application/obtener-mi-negocio.usecase.js";
import { ActualizarMiNegocioUseCase } from "./application/actualizar-mi-negocio.usecase.js";
import { CambiarMonedaNegocioUseCase } from "./application/cambiar-moneda-negocio.usecase.js";
import { ObtenerLimitesNegocioUseCase } from "./application/obtener-limites-negocio.usecase.js";
import { ValidarLimiteNegocioUseCase } from "./application/validar-limite-negocio.usecase.js";
import { ObtenerFacturacionNegocioUseCase } from "./application/obtener-facturacion-negocio.usecase.js";
import { ActualizarFacturacionNegocioUseCase } from "./application/actualizar-facturacion-negocio.usecase.js";
import { PrismaMonedaRepository } from "../moneda/infrastructure/prisma-moneda.repository.js";
import { PrismaUsuarioRepository } from "../usuarios/infrastructure/prisma-usuario.repository.js";
import { PrismaSucursalRepository } from "../sucursal/infrastructure/prisma-sucursal.repository.js";
import { PrismaProductoRepository } from "../producto/infrastructure/prisma-producto.repository.js";
import { PrismaVarianteRepository } from "../producto/infrastructure/prisma-variante.repository.js";
import { PrismaVehiculoRepository } from "../vehiculo/infrastructure/prisma-vehiculo.repository.js";
import { PrismaCajaRepository } from "../caja/infrastructure/prisma-caja.repository.js";
import { PrismaCuentaBancariaRepository } from "../cuenta-bancaria/infrastructure/prisma-cuenta-bancaria.repository.js";
import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";
import { crearMediaUseCase, reemplazarMediaUseCase } from "../media/media.module.js";

const negocioRepository = new PrismaNegocioRepository(prisma);
const monedaRepository = new PrismaMonedaRepository(prisma);
const usuarioRepository = new PrismaUsuarioRepository(prisma);
const sucursalRepository = new PrismaSucursalRepository(prisma);
const productoRepository = new PrismaProductoRepository(prisma);
const varianteRepository = new PrismaVarianteRepository(prisma);
const vehiculoRepository = new PrismaVehiculoRepository(prisma);
const cajaRepository = new PrismaCajaRepository(prisma);
const cuentaBancariaRepository = new PrismaCuentaBancariaRepository(prisma);

const registrarNegocioUseCase = new RegistrarNegocioUseCase(negocioRepository, crearMediaUseCase);
const actualizarNegocioUseCase = new ActualizarNegocioUseCase(negocioRepository, reemplazarMediaUseCase);
const obtenerNegocioUseCase = new ObtenerNegocioUseCase(negocioRepository);
const obtenerMiNegocioUseCase = new ObtenerMiNegocioUseCase(negocioRepository);
const actualizarMiNegocioUseCase = new ActualizarMiNegocioUseCase(negocioRepository, reemplazarMediaUseCase);
const cambiarMonedaNegocioUseCase = new CambiarMonedaNegocioUseCase(negocioRepository, monedaRepository);
const obtenerLimitesNegocioUseCase = new ObtenerLimitesNegocioUseCase(
    negocioRepository,
    usuarioRepository,
    sucursalRepository,
    productoRepository,
    varianteRepository,
    vehiculoRepository,
    cajaRepository,
    cuentaBancariaRepository
);
const obtenerFacturacionNegocioUseCase = new ObtenerFacturacionNegocioUseCase(negocioRepository);
const actualizarFacturacionNegocioUseCase = new ActualizarFacturacionNegocioUseCase(negocioRepository);
export const validarLimiteNegocioUseCase = new ValidarLimiteNegocioUseCase(negocioRepository);

export const negocioController = new NegocioController(
    registrarNegocioUseCase,
    actualizarNegocioUseCase,
    obtenerNegocioUseCase,
    obtenerMiNegocioUseCase,
    actualizarMiNegocioUseCase,
    cambiarMonedaNegocioUseCase,
    obtenerLimitesNegocioUseCase,
    obtenerFacturacionNegocioUseCase,
    actualizarFacturacionNegocioUseCase,
    storageProvider
);
