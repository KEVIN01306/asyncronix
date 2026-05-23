import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { marcaController } from "../marca.module.js";
import { marcaListQuerySchema } from "./validators/marca.schema.js";

const router = Router();
const validar = new ValidarMiddleware();
const auth = new AuthMiddleware();

router.use(auth.protegerRuta);

router.get("/",
    auth.verificarPermiso(['VER_MARCAS']),
    validar.validarQuery(marcaListQuerySchema),
    marcaController.listar
);

router.get("/:id",
    auth.verificarPermiso(['VER_MARCAS_DETALLE']),
    marcaController.obtener
);

export default router;
