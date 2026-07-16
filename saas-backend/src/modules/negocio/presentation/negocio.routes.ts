import { Router } from "express";
import { negocioController } from "../negocio.module.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { FileUploadMiddleware } from "@shared/presentation/middlewares/upload.middleware.js";
import { negocioActualizarSchema, negocioCrearSchema, negocioCambiarMonedaSchema } from "./validators/negocio.validator.js";

const router = Router()

const authMiddleware = new AuthMiddleware()
const validarMiddleware = new ValidarMiddleware()

router.use(authMiddleware.protegerRuta)

router.get("/me",
    authMiddleware.verificarPermiso(['VER_NEGOCIOS_DETALLE_ME']),
    negocioController.me
);

router.get("/me/limites",
    authMiddleware.verificarPermiso(['VER_NEGOCIOS_DETALLE_ME']), // Assuming the same permission applies for viewing limits, or just let the user view it
    negocioController.limites
);

router.put("/me",
    authMiddleware.verificarPermiso(['EDITAR_NEGOCIOS']),
    FileUploadMiddleware.single('logo', 'negocios'),
    validarMiddleware.validarBody(negocioActualizarSchema),
    negocioController.editMe
);

router.put("/me/moneda",
    authMiddleware.verificarPermiso(['NEGOCIOS_CAMBIAR_MONEDA']),
    validarMiddleware.validarBody(negocioCambiarMonedaSchema),
    negocioController.cambiarMoneda
);

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
