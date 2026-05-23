import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { modeloController } from "../modelo.module.js";
import { modeloListQuerySchema } from "./validators/modelo.schema.js";

const router = Router();
const validar = new ValidarMiddleware();
const auth = new AuthMiddleware();

router.use(auth.protegerRuta);

router.get("/",
    auth.verificarPermiso(['VER_MODELOS']),
    validar.validarQuery(modeloListQuerySchema),
    modeloController.listar
);

router.get("/:id",
    auth.verificarPermiso(['VER_MODELOS_DETALLE']),
    modeloController.obtener
);

export default router;
