import { Router } from "express";
import { z } from "zod";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { categoriaController } from "../categoria.module.js";
import { categoriaCrearSchema, categoriaActualizarSchema } from "./validators/categoria.schema.js";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

const categoriaListQuerySchema = paginacionQuerySchema.extend({
    q: z.string().trim().optional()
});

const categoriasPadresDisponiblesQuerySchema = z.object({
    categoria_id_excluir: z.string().uuid().optional()
});

const router = Router();
const validarMiddleware = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.post("/", 
    authMiddleware.verificarPermiso(['CREAR_CATEGORIAS_PRODUCTOS']),
    validarMiddleware.validarBody(categoriaCrearSchema), 
    categoriaController.registrar
);

router.get("/padres-disponibles", 
    authMiddleware.verificarPermiso(['CREAR_CATEGORIAS_PRODUCTOS', 'EDITAR_CATEGORIAS_PRODUCTOS']),
    validarMiddleware.validarQuery(categoriasPadresDisponiblesQuerySchema),
    categoriaController.obtenerPadresDisponibles
);

router.get("/", 
    authMiddleware.verificarPermiso(['VER_CATEGORIAS_PRODUCTOS']),
    validarMiddleware.validarQuery(categoriaListQuerySchema), 
    categoriaController.listar
);

router.get("/:id/jerarquia", 
    authMiddleware.verificarPermiso(['VER_CATEGORIAS_PRODUCTOS_DETALLE']),
    categoriaController.obtenerConJerarquia
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
