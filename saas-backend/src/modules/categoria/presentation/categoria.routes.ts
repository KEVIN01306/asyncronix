import { Router } from "express";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { categoriaController } from "../categoria.module.js";
import { categoriaCrearSchema, categoriaActualizarSchema, categoriaListarQuerySchema } from "./validators/categoria.schema.js";

const router = Router();
const validarMiddleware = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.post("/", 
    authMiddleware.verificarRol(['ADMIN']),
    validarMiddleware.validarBody(categoriaCrearSchema), 
    categoriaController.registrar
);

router.get("/", 
    authMiddleware.verificarRol(['ADMIN', 'VENDEDOR']),
    validarMiddleware.validarQuery(categoriaListarQuerySchema), 
    categoriaController.listar
);

router.get("/:id", 
    authMiddleware.verificarRol(['ADMIN', 'VENDEDOR']),
    categoriaController.obtener
);

router.put("/:id", 
    authMiddleware.verificarRol(['ADMIN']),
    validarMiddleware.validarBody(categoriaActualizarSchema), 
    categoriaController.actualizar
);

router.delete("/:id", 
    authMiddleware.verificarRol(['ADMIN']),
    categoriaController.eliminar
);

export default router;
