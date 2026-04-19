import { Router } from "express";
import { negocioController } from "../negocio.module.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { FileUploadMiddleware } from "@shared/presentation/middlewares/upload.middleware.js";
import { negocioActualizarSchema, negocioCrearSchema } from "./validators/negocio.validator.js";

const router = Router()

const authMiddleware = new AuthMiddleware()
const validarMiddleware = new ValidarMiddleware()

router.use(authMiddleware.protegerRuta)

router.get("/:id",
    negocioController.obtener
);

router.post("/",
    FileUploadMiddleware.single('logo', 'negocios'),
    validarMiddleware.validarBody(negocioCrearSchema),
    negocioController.registrar
);

router.use(authMiddleware.verificarRol(['ADMIN']))

router.put("/:id",
    FileUploadMiddleware.single('logo', 'negocios'),
    validarMiddleware.validarBody(negocioActualizarSchema),
    negocioController.actualizar
);

export default router
