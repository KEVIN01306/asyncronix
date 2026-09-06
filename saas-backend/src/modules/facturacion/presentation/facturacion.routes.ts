import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { facturacionController } from "../module.js";

const router = Router();
const auth = new AuthMiddleware();

router.use(auth.protegerRuta);
router.get("/digifact/nit/:nit", facturacionController.consultarNit);

export default router;
