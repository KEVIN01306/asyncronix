import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { bancoController } from "../banco.module.js";
import { bancoIdParamSchema, bancoListQuerySchema } from "./validators/banco.schema.js";

const router = Router();
const validar = new ValidarMiddleware();
const auth = new AuthMiddleware();

router.use(auth.protegerRuta);

router.get(
    '/',
    auth.verificarPermiso(['VER_BANCOS']),
    validar.validarQuery(bancoListQuerySchema),
    bancoController.listar
);

router.get(
    '/:id',
    auth.verificarPermiso(['VER_BANCOS']),
    validar.validarParams(bancoIdParamSchema),
    bancoController.obtener
);

export default router;
