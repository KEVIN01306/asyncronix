import type { NextFunction, Request, Response } from 'express';
import BaseController from '@shared/presentation/base.controller.js';
import Respuesta from '@app/http/respuesta.js';
import type { ObtenerCajaUseCase } from '../application/obtener-caja.usecase.js';
import type { ObtenerCajasUseCase } from '../application/obtener-cajas.usecase.js';
import type { RegistrarCajaUseCase } from '../application/registrar-caja.usecase.js';
import type { ActualizarCajaUseCase } from '../application/actualizar-caja.usecase.js';
import type { EliminarCajaUseCase } from '../application/eliminar-caja.usecase.js';

export class CajaController extends BaseController {
    constructor(
        private readonly obtenerCajaUseCase: ObtenerCajaUseCase,
        private readonly obtenerCajasUseCase: ObtenerCajasUseCase,
        private readonly registrarCajaUseCase: RegistrarCajaUseCase,
        private readonly actualizarCajaUseCase: ActualizarCajaUseCase,
        private readonly eliminarCajaUseCase: EliminarCajaUseCase
    ) {
        super();
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const { limit, offset, q } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerCajasUseCase.execute(negocio_id, sucursal_id, page, limit, q);
            res.status(200).json(Respuesta.paginacion('Cajas obtenidas con éxito', data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const caja = await this.obtenerCajaUseCase.execute(id, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito('Caja obtenida con éxito', caja));
        } catch (error) {
            next(error);
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const caja = await this.registrarCajaUseCase.execute(req.body, negocio_id, sucursal_id);
            res.status(201).json(Respuesta.exito('Caja creada con éxito', caja));
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const caja = await this.actualizarCajaUseCase.execute(id, negocio_id, sucursal_id, req.body);
            res.status(200).json(Respuesta.exito('Caja actualizada con éxito', caja));
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            await this.eliminarCajaUseCase.execute(id, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito('Caja eliminada con éxito', null));
        } catch (error) {
            next(error);
        }
    }
}
