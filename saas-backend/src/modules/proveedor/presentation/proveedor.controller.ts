import type { NextFunction, Request, Response } from 'express';
import BaseController from '../../../shared/presentation/base.controller.js';
import Respuesta from '../../../app/http/respuesta.js';
import type { ObtenerProveedorUseCase } from '../application/obtener-proveedor.usecase.js';
import type { ObtenerProveedoresUseCase } from '../application/obtener-proveedores.usecase.js';
import type { RegistrarProveedorUseCase } from '../application/registrar-proveedor.usecase.js';
import type { ActualizarProveedorUseCase } from '../application/actualizar-proveedor.usecase.js';
import type { EliminarProveedorUseCase } from '../application/eliminar-proveedor.usecase.js';

export class ProveedorController extends BaseController {
    constructor(
        private readonly obtenerProveedorUseCase: ObtenerProveedorUseCase,
        private readonly obtenerProveedoresUseCase: ObtenerProveedoresUseCase,
        private readonly registrarProveedorUseCase: RegistrarProveedorUseCase,
        private readonly actualizarProveedorUseCase: ActualizarProveedorUseCase,
        private readonly eliminarProveedorUseCase: EliminarProveedorUseCase,
    ) { super(); }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerProveedoresUseCase.execute({ negocio_id, page, perPage: limit });
            res.status(200).json(Respuesta.paginacion('Proveedores obtenidos', data, total, limit, offset));
        } catch (error) { next(error); }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const prov = await this.obtenerProveedorUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Proveedor obtenido', prov));
        } catch (error) { next(error); }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const prov = await this.registrarProveedorUseCase.execute(req.body, negocio_id);
            res.status(201).json(Respuesta.exito('Proveedor creado', prov));
        } catch (error) { next(error); }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const prov = await this.actualizarProveedorUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Proveedor actualizado', prov));
        } catch (error) { next(error); }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarProveedorUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Proveedor eliminado', null));
        } catch (error) { next(error); }
    }
}
