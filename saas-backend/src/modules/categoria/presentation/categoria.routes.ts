import { Router } from "express";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { categoriaController } from "../categoria.module.js";
import { categoriaCrearSchema, categoriaActualizarSchema } from "./validators/categoria.schema.js";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";


const router = Router();
const validarMiddleware = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.post("/", 
    authMiddleware.verificarPermiso(['CREAR_CATEGORIAS_PRODUCTOS']),
    validarMiddleware.validarBody(categoriaCrearSchema), 
    categoriaController.registrar
);

router.get("/", 
    authMiddleware.verificarPermiso(['VER_CATEGORIAS_PRODUCTOS']),
    validarMiddleware.validarQuery(paginacionQuerySchema), 
    categoriaController.listar
);

router.get("/:id", 
    authMiddleware.verificarPermiso(['VER_CATEGORIAS_PRODUCTOS_DETALLE']),
    categoriaController.obtener
);

router.put("/:id", 
    authMiddleware.verificarPermiso(['EDITAR_CATEGORIAS_PRODUCTOS']),
    validarMiddleware.validarBody(categoriaActualizarSchema), 
    categoriaController.actualizar
);

router.delete("/:id", 
    authMiddleware.verificarRol(['ELIMINAR_CATEGORIAS_PRODUCTOS']),
    categoriaController.eliminar
);

export default router;
