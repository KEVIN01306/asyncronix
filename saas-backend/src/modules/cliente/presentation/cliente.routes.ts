import { Router } from "express";
import { clienteController } from "../cliente.module.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import {
    clienteActualizarSchema,
    clienteBuscarGlobalQuerySchema,
    clienteBuscarSchema,
    clienteCrearSchema,
    clienteListQuerySchema,
    clienteUnificarResumenQuerySchema,
    clienteUnificarSchema
} from "./validators/cliente.validator.js";

const router = Router();

const authMiddleware = new AuthMiddleware();
const validarMiddleware = new ValidarMiddleware();

router.use(authMiddleware.protegerRuta);

router.get("/buscar",
    authMiddleware.verificarPermiso(["VER_CLIENTES"]),
    validarMiddleware.validarQuery(clienteBuscarSchema),
    clienteController.buscarPorDocumento
);

router.get("/buscar-global",
    authMiddleware.verificarPermiso(["VER_CLIENTES"]),
    validarMiddleware.validarQuery(clienteBuscarGlobalQuerySchema),
    clienteController.buscarGlobal
);

router.get("/unificar/resumen",
    authMiddleware.verificarPermiso(["EDITAR_CLIENTES", "CREAR_CLIENTES"]),
    validarMiddleware.validarQuery(clienteUnificarResumenQuerySchema),
    clienteController.resumenUnificacion
);

router.post("/unificar",
    authMiddleware.verificarPermiso(["EDITAR_CLIENTES", "CREAR_CLIENTES"]),
    validarMiddleware.validarBody(clienteUnificarSchema),
    clienteController.unificar
);

router.get("/nit/:nit",
    authMiddleware.verificarPermiso(["VER_CLIENTES"]),
    clienteController.buscarPorNit
);

router.get("/dpi/:dpi",
    authMiddleware.verificarPermiso(["VER_CLIENTES"]),
    clienteController.buscarPorDpi
);

router.get("/",
    authMiddleware.verificarPermiso(["VER_CLIENTES"]),
    validarMiddleware.validarQuery(clienteListQuerySchema),
    clienteController.listar
);

router.get("/:id",
    authMiddleware.verificarPermiso(["VER_CLIENTES_DETALLE", "VER_CLIENTES"]),
    clienteController.obtener
);

router.post("/",
    authMiddleware.verificarPermiso(["CREAR_CLIENTES"]),
    validarMiddleware.validarBody(clienteCrearSchema),
    clienteController.registrar
);

router.put("/:id",
    authMiddleware.verificarPermiso(["EDITAR_CLIENTES"]),
    validarMiddleware.validarBody(clienteActualizarSchema),
    clienteController.actualizar
);

router.post("/:id/reenviar-credenciales",
    authMiddleware.verificarPermiso(["EDITAR_CLIENTES"]),
    clienteController.reenviarCredenciales
);

router.delete("/:id",
    authMiddleware.verificarPermiso(["ELIMINAR_CLIENTES"]),
    clienteController.eliminar
);

export default router;
