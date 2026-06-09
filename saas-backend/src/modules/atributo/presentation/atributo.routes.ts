import { Router } from 'express';
import prisma from '@infrastructure/config/prisma.js';
import AtributoController from './atributo.controller.js';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';

const router = Router();
const authMiddleware = new AuthMiddleware();
const controller = new AtributoController(prisma);

router.use(authMiddleware.protegerRuta);

router.get('/',
    authMiddleware.verificarPermiso(['VER_ATRIBUTOS']),
    controller.listar
);
router.post('/',
    authMiddleware.verificarPermiso(['CREAR_ATRIBUTOS']),
    controller.crear
);
router.put('/:id',
    authMiddleware.verificarPermiso(['EDITAR_ATRIBUTOS']),
    controller.actualizar
);
router.delete('/:id',
    authMiddleware.verificarPermiso(['ELIMINAR_ATRIBUTOS']),
    controller.eliminar
);

// valores
router.get('/:id/valores',
    authMiddleware.verificarPermiso(['VER_ATRIBUTOS']),
    controller.listarValores
);
router.post('/:id/valores',
    authMiddleware.verificarPermiso(['EDITAR_ATRIBUTOS']),
    controller.crearValor
);
router.put('/valores/:id',
    authMiddleware.verificarPermiso(['EDITAR_ATRIBUTOS']),
    controller.actualizarValor
);
router.delete('/valores/:id',
    authMiddleware.verificarPermiso(['EDITAR_ATRIBUTOS']),
    controller.eliminarValor
);

export default router;
