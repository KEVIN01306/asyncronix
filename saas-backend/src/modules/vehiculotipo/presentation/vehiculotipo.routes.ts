import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { vehiculotipoController } from "../vehiculotipo.module.js";
import { vehiculotipoListQuerySchema } from "./validators/vehiculotipo.schema.js";

const router = Router();
const validar = new ValidarMiddleware();
const auth = new AuthMiddleware();

router.use(auth.protegerRuta);

router.get('/', auth.verificarPermiso(['VER_VEHICULOS_TIPOS']), validar.validarQuery(vehiculotipoListQuerySchema), vehiculotipoController.listar);

export default router;
