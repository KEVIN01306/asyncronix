import { ActualizarProductoUseCase } from "./application/actualizar-producto.usecase.js";
import { EliminarProductoUseCase } from "./application/eliminar-producto.usecase.js";
import { ObtenerProductoUseCase } from "./application/obtener-producto.usecase.js";
import { ObtenerProductosUseCase } from "./application/obtener-productos.usecase.js";
import { RegistrarProductoUseCase } from "./application/registrar-producto.usecase.js";
import { SubirImagenProductoUseCase } from "./application/subir-imagen-producto.usecase.js";
import { CrearVarianteUseCase } from "./application/crear-variante.usecase.js";
import { ActualizarVarianteUseCase } from "./application/actualizar-variante.usecase.js";
import { EliminarVarianteUseCase } from "./application/eliminar-variante.usecase.js";
import { ListarVariantesProductoUseCase } from "./application/listar-variantes-producto.usecase.js";
import { ObtenerVarianteUseCase } from "./application/obtener-variante.usecase.js";
import { SubirImagenVarianteUseCase } from "./application/subir-imagen-variante.usecase.js";
import { ActualizarCodigoBarrasVarianteUseCase } from "./application/actualizar-codigo-barras-variante.usecase.js";
import { GenerarQrVarianteUseCase } from "./application/generar-qr-variante.usecase.js";
import { ListarAtributosProductoUseCase } from "./application/listar-atributos-producto.usecase.js";
import { ActualizarAtributosProductoUseCase } from "./application/actualizar-atributos-producto.usecase.js";
import { ListarVariantesNegocioUseCase } from "./application/listar-variantes-negocio.usecase.js";
import { ObtenerSecuenciaUseCase } from "./application/obtener-secuencia.usecase.js";
import { PrismaProductoRepository } from "./infrastructure/prisma-producto.repository.js";
import { PrismaVarianteRepository } from "./infrastructure/prisma-variante.repository.js";
import { PrismaBarcodeSequenceRepository } from "./infrastructure/prisma-barcode-sequence.repository.js";
import { ProductoController } from "./presentation/producto.controller.js";
import prisma from "@infrastructure/config/prisma.js";

const productoRepository = new PrismaProductoRepository(prisma);
const varianteRepository = new PrismaVarianteRepository(prisma);
const barcodeSequenceRepository = new PrismaBarcodeSequenceRepository(prisma);

const obtenerProductoUseCase = new ObtenerProductoUseCase(productoRepository);
const obtenerProductosUseCase = new ObtenerProductosUseCase(productoRepository);
const eliminarProductoUseCase = new EliminarProductoUseCase(productoRepository);
const subirImagenProductoUseCase = new SubirImagenProductoUseCase(productoRepository);
const obtenerSecuenciaUseCase = new ObtenerSecuenciaUseCase(barcodeSequenceRepository);
const crearVarianteUseCase = new CrearVarianteUseCase(varianteRepository, obtenerSecuenciaUseCase);
const registrarProductoUseCase = new RegistrarProductoUseCase(productoRepository, varianteRepository, obtenerSecuenciaUseCase);
const actualizarProductoUseCase = new ActualizarProductoUseCase(productoRepository);
const listarAtributosProductoUseCase = new ListarAtributosProductoUseCase(productoRepository);
const actualizarAtributosProductoUseCase = new ActualizarAtributosProductoUseCase(productoRepository);
const actualizarVarianteUseCase = new ActualizarVarianteUseCase(varianteRepository);
const eliminarVarianteUseCase = new EliminarVarianteUseCase(varianteRepository);
const listarVariantesProductoUseCase = new ListarVariantesProductoUseCase(varianteRepository);
const listarVariantesNegocioUseCase = new ListarVariantesNegocioUseCase(varianteRepository);
const obtenerVarianteUseCase = new ObtenerVarianteUseCase(varianteRepository);
const subirImagenVarianteUseCase = new SubirImagenVarianteUseCase(varianteRepository);
const actualizarCodigoBarrasVarianteUseCase = new ActualizarCodigoBarrasVarianteUseCase(varianteRepository);
const generarQrVarianteUseCase = new GenerarQrVarianteUseCase(varianteRepository);

export const productoController = new ProductoController(
    obtenerProductoUseCase,
    obtenerProductosUseCase,
    registrarProductoUseCase,
    actualizarProductoUseCase,
    eliminarProductoUseCase,
    subirImagenProductoUseCase,
    crearVarianteUseCase,
    actualizarVarianteUseCase,
    eliminarVarianteUseCase,
    listarVariantesProductoUseCase,
    listarVariantesNegocioUseCase,
    obtenerVarianteUseCase,
    subirImagenVarianteUseCase,
    actualizarCodigoBarrasVarianteUseCase,
    generarQrVarianteUseCase,
    listarAtributosProductoUseCase,
    actualizarAtributosProductoUseCase
);
