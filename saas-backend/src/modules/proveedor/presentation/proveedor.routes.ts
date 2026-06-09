import { Router } from 'express';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { proveedorController } from '../proveedor.module.js';
import { ProveedorValidator } from './validators/proveedor.validator.js';
import { paginacionQuerySchema } from '@shared/presentation/validators/paginacion.query.schema.js';

const router = Router();

const authMiddleware = new AuthMiddleware();
const validarMiddleware = new ValidarMiddleware();

router.use(authMiddleware.protegerRuta);

router.get('/',
    authMiddleware.verificarPermiso(['VER_PROVEEDORES']),
    validarMiddleware.validarQuery(paginacionQuerySchema),
    proveedorController.listar
);

router.get('/:id',
    authMiddleware.verificarPermiso(['VER_PROVEEDORES_DETALLE']),
    proveedorController.obtener
);

router.post('/',
    authMiddleware.verificarPermiso(['CREAR_PROVEEDORES']),
    validarMiddleware.validarBody(ProveedorValidator.crear),
    proveedorController.registrar
);

router.put('/:id',
    authMiddleware.verificarPermiso(['EDITAR_PROVEEDORES']),
    validarMiddleware.validarBody(ProveedorValidator.actualizar),
    proveedorController.actualizar
);

router.delete('/:id',
    authMiddleware.verificarPermiso(['ELIMINAR_PROVEEDORES']),
    proveedorController.eliminar
);

export default router;
