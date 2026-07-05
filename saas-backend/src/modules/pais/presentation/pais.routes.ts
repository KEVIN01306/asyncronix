import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { paisController } from "../pais.module.js";
import { paisIdParamSchema, paisListQuerySchema } from "./validators/pais.schema.js";

const router = Router();
const validar = new ValidarMiddleware();
const auth = new AuthMiddleware();

router.use(auth.protegerRuta);

router.get("/",
    auth.verificarPermiso(['VER_PAISES']),
    validar.validarQuery(paisListQuerySchema),
    paisController.listar
);

router.get("/:id",
    auth.verificarPermiso(['VER_DETALLE_PAIS']),
    validar.validarParams(paisIdParamSchema),
    paisController.obtener
);

export default router;
