import { Router } from "express";
import { ValidarMiddleware } from "../../../app/middlewares/ValidarMiddleware.js";
import { AuthMiddleware } from "../../../app/middlewares/AuthMiddleware.js";

import { gastoController } from "../gasto.module.js";
import { gastoCrearSchema, gastoActualizarSchema, gastoListarQuerySchema } from "./validators/gasto.schema.js";

const router = Router();
const validarMiddleware = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.post("/", 
    authMiddleware.verificarRol(['ADMIN']),
    validarMiddleware.validarBody(gastoCrearSchema), 
    gastoController.registrar
);

router.get("/", 
    authMiddleware.verificarRol(['ADMIN', 'VENDEDOR']),
    validarMiddleware.validarQuery(gastoListarQuerySchema), 
    gastoController.listar
);


router.get("/:id", 
    authMiddleware.verificarRol(['ADMIN', 'VENDEDOR']),
    gastoController.obtener
);

router.put("/:id", 
    authMiddleware.verificarRol(['ADMIN']),
    validarMiddleware.validarBody(gastoActualizarSchema), 
    gastoController.actualizar
);

router.delete("/:id", 
    authMiddleware.verificarRol(['ADMIN']),
    gastoController.eliminar
);

export default router;
