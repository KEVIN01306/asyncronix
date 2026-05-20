import { Router } from "express";
import { AuthMiddleware } from "../../../app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "../../../app/middlewares/ValidarMiddleware.js";
import { ventaController } from "../venta.module.js";
import { ventaCrearSchema, ventaActualizarSchema } from "./validators/venta.schema.js";
import { paginacionQuerySchema } from "../../../shared/presentation/validators/paginacion.query.schema.js";

const routes = Router();
const authMiddleware = new AuthMiddleware();
const validarMiddleware = new ValidarMiddleware();

routes.use(authMiddleware.protegerRuta);

routes.post("/",
    authMiddleware.verificarPermiso(['CREAR_VENTAS']),
    validarMiddleware.validarBody(ventaCrearSchema),
    ventaController.registrar
);

routes.get("/",
    authMiddleware.verificarPermiso(['VER_VENTAS']),
    validarMiddleware.validarQuery(paginacionQuerySchema),
    ventaController.listar
);

routes.get("/:id",
    authMiddleware.verificarPermiso(['VER_VENTAS_DETALLE']),
    ventaController.obtener
);

routes.put("/:id",
    authMiddleware.verificarPermiso(['EDITAR_VENTAS']),
    validarMiddleware.validarBody(ventaActualizarSchema),
    ventaController.actualizar
);

routes.patch("/:id/anular",
    authMiddleware.verificarPermiso(['ANULAR_VENTAS']),
    ventaController.anular
);

export default routes;
