import { Router } from "express";
import { AuthMiddleware } from "../../../app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "../../../app/middlewares/ValidarMiddleware.js";
import { facturacionController } from "../module.js";
import {
    listarFacturasQuerySchema,
    resumenFiscalQuerySchema,
    actualizarConfiguracionFiscalSchema,
    descargarDocumentoParamsSchema
} from "./schemas/facturacion.schema.js";

const router = Router();
const auth = new AuthMiddleware();
const validar = new ValidarMiddleware();

router.use(auth.protegerRuta);

// Listado de facturas emitidas por rango de fechas
router.get(
    "/",
    auth.verificarPermiso(['VER_FACTURAS']),
    validar.validarQuery(listarFacturasQuerySchema),
    facturacionController.listar
);

// Resumen fiscal por rango de fechas
router.get(
    "/resumen",
    auth.verificarPermiso(['VER_RESUMEN_FISCAL']),
    validar.validarQuery(resumenFiscalQuerySchema),
    facturacionController.resumen
);

// Consulta de configuración fiscal del negocio
router.get(
    "/configuracion",
    auth.verificarPermiso(['VER_CONFIGURACION_FISCAL', 'VER_NEGOCIOS_DETALLE_ME']),
    facturacionController.obtenerConfiguracion
);

// Edición de configuración fiscal del negocio
router.put(
    "/configuracion",
    auth.verificarPermiso(['EDITAR_CONFIGURACION_FISCAL', 'EDITAR_NEGOCIOS']),
    validar.validarBody(actualizarConfiguracionFiscalSchema),
    facturacionController.actualizarConfiguracion
);

// Obtener referencia / descarga de documento XML o PDF
router.get(
    "/:id/documento/:tipo",
    auth.verificarPermiso(['DESCARGAR_FACTURAS', 'VER_FACTURAS']),
    validar.validarParams(descargarDocumentoParamsSchema),
    facturacionController.descargarDocumento
);

// Consulta de NIT en Digifact
router.get(
    "/digifact/nit/:nit",
    facturacionController.consultarNit
);

export default router;
