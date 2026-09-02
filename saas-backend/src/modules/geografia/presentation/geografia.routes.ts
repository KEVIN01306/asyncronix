import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { geografiaController } from "../geografia.module.js";

const router = Router();
const auth = new AuthMiddleware();

router.use(auth.protegerRuta);

router.get("/departamentos", geografiaController.departamentos);
router.get("/municipios", geografiaController.municipios);

export default router;
