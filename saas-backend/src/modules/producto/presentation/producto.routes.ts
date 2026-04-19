import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { FileUploadMiddleware } from "@shared/presentation/middlewares/upload.middleware.js";
import { productoController } from "../producto.module.js";
import {
    productoCrearSchema,
    productoActualizarSchema,
    productoListarQuerySchema,
    productoImagenActualizarSchema,
    productoBulkEliminarSchema
} from "./validators/producto.schema.js";

const routes = Router();
const authMiddleware = new AuthMiddleware();
const validarMiddleware = new ValidarMiddleware();

routes.use(authMiddleware.protegerRuta);

// Productos CRUD
routes.post("/",
    authMiddleware.verificarRol(['ADMIN']),
    validarMiddleware.validarBody(productoCrearSchema),
    productoController.registrar
);

routes.get("/",
    authMiddleware.verificarRol(['ADMIN', 'VENDEDOR']),
    validarMiddleware.validarQuery(productoListarQuerySchema),
    productoController.listar
);

routes.get("/:id",
    authMiddleware.verificarRol(['ADMIN', 'VENDEDOR']),
    productoController.obtener
);

routes.put("/:id",
    authMiddleware.verificarRol(['ADMIN']),
    validarMiddleware.validarBody(productoActualizarSchema),
    productoController.actualizar
);

routes.delete("/:id",
    authMiddleware.verificarRol(['ADMIN']),
    productoController.eliminar
);

// Imagenes
routes.post("/imagenes/:producto_id",
    authMiddleware.verificarRol(['ADMIN']),
    FileUploadMiddleware.single('imagen', 'productos'),
    productoController.subirImagen
);

routes.put("/imagenes/:id",
    authMiddleware.verificarRol(['ADMIN']),
    validarMiddleware.validarBody(productoImagenActualizarSchema),
    productoController.actualizarImagen
);

routes.delete("/imagenes/:id",
    authMiddleware.verificarRol(['ADMIN']),
    productoController.eliminarImagen
);

routes.delete("/imagenes",
    authMiddleware.verificarRol(['ADMIN']),
    validarMiddleware.validarBody(productoBulkEliminarSchema),
    productoController.eliminarImagenesBulk
);

export default routes;
