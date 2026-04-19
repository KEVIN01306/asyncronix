import { Router } from "express";
import { proveedorController } from "../proveedor.module.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { proveedorActualizarSchema, proveedorCrearSchema } from "./validators/proveedor.validator.js";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

const router = Router()

const authMiddleware = new AuthMiddleware()
const validarMiddleware = new ValidarMiddleware()

router.use(authMiddleware.protegerRuta)
router.use(authMiddleware.verificarRol(['ADMIN']))

router.get('/',
    validarMiddleware.validarQuery(paginacionQuerySchema),
    proveedorController.listar
);

router.get('/:id',
    proveedorController.obtener
);

router.post('/',
    validarMiddleware.validarBody(proveedorCrearSchema),
    proveedorController.registrar
);

router.put('/:id',
    validarMiddleware.validarBody(proveedorActualizarSchema),
    proveedorController.actualizar
);

router.delete('/:id',
    proveedorController.eliminar
);

export default router
