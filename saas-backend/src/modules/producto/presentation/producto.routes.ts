import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { FileUploadMiddleware } from "@shared/presentation/middlewares/upload.middleware.js";
import { productoController } from "../producto.module.js";
import {
    productoCrearSchema,
    productoActualizarSchema,
    productoListarQuerySchema
} from "./validators/producto.schema.js";
import {
    varianteCrearSchema,
    varianteActualizarSchema,
    varianteCodigoBarrasSchema
} from "./validators/variante.schema.js";

const routes = Router();
const authMiddleware = new AuthMiddleware();
const validarMiddleware = new ValidarMiddleware();

routes.use(authMiddleware.protegerRuta);

routes.post("/",
    authMiddleware.verificarPermiso(['CREAR_PRODUCTOS']),
    validarMiddleware.validarBody(productoCrearSchema),
    productoController.registrar
);

routes.get("/",
    authMiddleware.verificarPermiso(['VER_PRODUCTOS']),
    validarMiddleware.validarQuery(productoListarQuerySchema),
    productoController.listar
);

routes.get("/:producto_id/variantes",
    authMiddleware.verificarPermiso(['VER_PRODUCTOS_DETALLE']),
    productoController.listarVariantes
);

routes.get("/variantes",
    authMiddleware.verificarPermiso(['VER_PRODUCTOS_DETALLE']),
    productoController.listarVariantesNegocio
);

routes.post("/:producto_id/variantes",
    authMiddleware.verificarPermiso(['CREAR_PRODUCTOS']),
    validarMiddleware.validarBody(varianteCrearSchema),
    productoController.crearVariante
);

routes.get("/variantes/:id",
    authMiddleware.verificarPermiso(['VER_PRODUCTOS_DETALLE']),
    productoController.obtenerVariante
);

routes.put("/variantes/:id",
    authMiddleware.verificarPermiso(['EDITAR_PRODUCTOS']),
    validarMiddleware.validarBody(varianteActualizarSchema),
    productoController.actualizarVariante
);

routes.post("/variantes/:id/imagen",
    authMiddleware.verificarPermiso(['EDITAR_PRODUCTOS']),
    FileUploadMiddleware.single('imagen', 'productos'),
    productoController.subirImagenVariante
);

routes.post("/variantes/:id/codigo-barras",
    authMiddleware.verificarPermiso(['EDITAR_PRODUCTOS']),
    validarMiddleware.validarBody(varianteCodigoBarrasSchema),
    productoController.actualizarCodigoBarrasVariante
);

routes.post("/variantes/:id/generar-qr",
    authMiddleware.verificarPermiso(['EDITAR_PRODUCTOS']),
    productoController.generarQrVariante
);

routes.delete("/variantes/:id",
    authMiddleware.verificarPermiso(['ELIMINAR_PRODUCTOS']),
    productoController.eliminarVariante
);

routes.get("/:id",
    authMiddleware.verificarPermiso(['VER_PRODUCTOS_DETALLE']),
    productoController.obtener
);

routes.put("/:id",
    authMiddleware.verificarPermiso(['EDITAR_PRODUCTOS']),
    validarMiddleware.validarBody(productoActualizarSchema),
    productoController.actualizar
);

routes.delete("/:id",
    authMiddleware.verificarPermiso(['ELIMINAR_PRODUCTOS']),
    productoController.eliminar
);

routes.post("/imagenes/:producto_id",
    authMiddleware.verificarPermiso(['EDITAR_PRODUCTOS']),
    FileUploadMiddleware.single('imagen', 'productos'),
    productoController.subirImagen
);

export default routes;
