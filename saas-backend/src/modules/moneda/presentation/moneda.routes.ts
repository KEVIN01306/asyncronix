import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { monedaController } from "../moneda.module.js";
import { monedaIdParamSchema, monedaListQuerySchema } from "./validators/moneda.schema.js";

const router = Router();
const validar = new ValidarMiddleware();
const auth = new AuthMiddleware();

router.use(auth.protegerRuta);

router.get("/",
    auth.verificarPermiso(['VER_MONEDAS']),
    validar.validarQuery(monedaListQuerySchema),
    monedaController.listar
);

router.get("/:id",
    auth.verificarPermiso(['VER_DETALLE_MONEDA']),
    validar.validarParams(monedaIdParamSchema),
    monedaController.obtener
);

export default router;
