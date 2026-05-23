import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { lineaController } from "../linea.module.js";
import { lineaListQuerySchema } from "./validators/linea.schema.js";

const router = Router();
const validar = new ValidarMiddleware();
const auth = new AuthMiddleware();

router.use(auth.protegerRuta);

router.get("/",
    auth.verificarPermiso(['VER_LINEAS']),
    validar.validarQuery(lineaListQuerySchema),
    lineaController.listar
);

router.get("/:id",
    auth.verificarPermiso(['VER_LINEAS_DETALLE']),
    lineaController.obtener
);

export default router;
