import { Router } from "express";
import { z } from "zod";
import { MetodoPago } from "@prisma/client";
import { AuthMiddleware } from "../../../app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "../../../app/middlewares/ValidarMiddleware.js";
import { ventaController } from "../venta.module.js";
import { ventaCrearSchema, ventaActualizarSchema, buscarScannerSchema, ventaAgregarProductoSchema } from "./validators/venta.schema.js";
import { buscarClienteNitVentaSchema, crearClienteVentaSchema } from "./validators/cliente-venta.schema.js";
import { preVentaCrearSchema, preVentaCantidadSchema, preVentaFinalizarSchema, pinCajaSchema, preVentaDetalleInputSchema } from "./validators/preventa.schema.js";
import { paginacionQuerySchema } from "../../../shared/presentation/validators/paginacion.query.schema.js";

const routes = Router();
const authMiddleware = new AuthMiddleware();
const validarMiddleware = new ValidarMiddleware();

const ventaListQuerySchema = paginacionQuerySchema.extend({
    cliente_id: z.string().uuid("Cliente inválido").optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    metodo_pago: z.nativeEnum(MetodoPago).optional(),
    q: z.string().trim().optional(),
    fecha_inicio: z.string().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    fecha_fin: z.string().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v)
});

routes.use(authMiddleware.protegerRuta);

routes.post("/",
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    validarMiddleware.validarBody(ventaCrearSchema),
    ventaController.registrar
);

routes.get("/",
    authMiddleware.verificarPermiso(['VER_VENTAS']),
    validarMiddleware.validarQuery(ventaListQuerySchema),
    ventaController.listar
);

routes.get("/buscar-sku",
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    validarMiddleware.validarQuery(buscarScannerSchema),
    ventaController.buscarPorCodigo
);

routes.get("/scanner",
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    validarMiddleware.validarQuery(buscarScannerSchema),
    ventaController.buscarPorCodigo
);

routes.get("/clientes/buscar-por-nit",
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    validarMiddleware.validarQuery(buscarClienteNitVentaSchema),
    ventaController.buscarClientePorNit
);

routes.post("/clientes",
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    validarMiddleware.validarBody(crearClienteVentaSchema),
    ventaController.registrarCliente
);

routes.post('/pre-ventas',
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    validarMiddleware.validarBody(preVentaCrearSchema),
    ventaController.crearPreVenta
);

routes.get('/pre-ventas',
    authMiddleware.verificarPermiso(['VER_VENTAS']),
    ventaController.listarPreVentas
);

routes.get('/pre-ventas/:id',
    authMiddleware.verificarPermiso(['VER_VENTAS']),
    ventaController.obtenerPreVenta
);

routes.patch('/pre-ventas/:id/cantidad',
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    validarMiddleware.validarBody(preVentaCantidadSchema),
    ventaController.actualizarCantidadPreVenta
);

routes.patch('/pre-ventas/detalles/:id/cantidad',
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    validarMiddleware.validarBody(preVentaCantidadSchema),
    ventaController.actualizarCantidadPreVenta
);

routes.delete('/pre-ventas/detalles/:id',
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    ventaController.eliminarDetallePreVenta
);

routes.post('/pre-ventas/:id/detalles',
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    validarMiddleware.validarBody(preVentaDetalleInputSchema),
    ventaController.crearDetallePreVenta
);

routes.patch('/pre-ventas/:id/cliente',
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    ventaController.actualizarClientePreVenta
);

routes.post('/pre-ventas/validar-pin',
    validarMiddleware.validarBody(pinCajaSchema),
    ventaController.validarPinCaja
);

routes.patch('/pre-ventas/:id/finalizar',
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    validarMiddleware.validarBody(preVentaFinalizarSchema),
    ventaController.finalizarPreVenta
);

routes.get("/:id",
    authMiddleware.verificarPermiso(['VER_VENTAS_DETALLE']),
    ventaController.obtener
);

// Nota: la edición de ventas se elimina. Solo ver, anular y finalizar.

routes.post("/:ventaId/agregar-producto",
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    validarMiddleware.validarBody(ventaAgregarProductoSchema),
    ventaController.agregarProducto
);

routes.delete("/:ventaId/detalles/:detalleId",
    authMiddleware.verificarPermiso(['EDITAR_VENTAS']),
    ventaController.eliminarDetalle
);

routes.patch("/:id/finalizar",
    authMiddleware.verificarPermiso(['EDITAR_VENTAS']),
    ventaController.finalizar
);

routes.patch("/:id/anular",
    authMiddleware.verificarPermiso(['ANULAR_VENTAS']),
    ventaController.anular
);

export default routes;
