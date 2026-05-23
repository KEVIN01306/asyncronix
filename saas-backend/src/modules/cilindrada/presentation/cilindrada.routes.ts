import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { cilindradaController } from "../cilindrada.module.js";
import { cilindradaListQuerySchema } from "./validators/cilindrada.schema.js";

const router = Router();
const validar = new ValidarMiddleware();
const auth = new AuthMiddleware();

router.use(auth.protegerRuta);

router.get("/",
    auth.verificarPermiso(['VER_CILINDRADAS']),
    validar.validarQuery(cilindradaListQuerySchema),
    cilindradaController.listar
);

router.get("/:id",
    auth.verificarPermiso(['VER_CILINDRADAS_DETALLE']),
    cilindradaController.obtener
);

export default router;
