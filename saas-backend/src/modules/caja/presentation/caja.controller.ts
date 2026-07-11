import type { NextFunction, Request, Response } from 'express';
import BaseController from '@shared/presentation/base.controller.js';
import Respuesta from '@app/http/respuesta.js';
import AppError from '@shared/errors/AppError.js';
import type { ObtenerCajaUseCase } from '../application/obtener-caja.usecase.js';
import type { ObtenerCajasUseCase } from '../application/obtener-cajas.usecase.js';
import type { RegistrarCajaUseCase } from '../application/registrar-caja.usecase.js';
import type { ActualizarCajaUseCase } from '../application/actualizar-caja.usecase.js';
import type { EliminarCajaUseCase } from '../application/eliminar-caja.usecase.js';
import type { AsociarDispositivoCajaUseCase } from '../application/asociar-dispositivo-caja.usecase.js';
import type { DesasociarDispositivoCajaUseCase } from '../application/desasociar-dispositivo-caja.usecase.js';
import type { ListarHistorialCajaUseCase } from '../application/listar-historial-caja.usecase.js';

export class CajaController extends BaseController {
    constructor(
        private readonly obtenerCajaUseCase: ObtenerCajaUseCase,
        private readonly obtenerCajasUseCase: ObtenerCajasUseCase,
        private readonly registrarCajaUseCase: RegistrarCajaUseCase,
        private readonly actualizarCajaUseCase: ActualizarCajaUseCase,
        private readonly eliminarCajaUseCase: EliminarCajaUseCase,
        private readonly asociarDispositivoCajaUseCase: AsociarDispositivoCajaUseCase,
        private readonly desasociarDispositivoCajaUseCase: DesasociarDispositivoCajaUseCase,
        private readonly listarHistorialCajaUseCase: ListarHistorialCajaUseCase
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

    asociarDispositivo = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id, id: usuario_id } = this.obtenerEntorno(res);
            const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
            const { pin_sucursal } = req.body;

            const caja = await this.asociarDispositivoCajaUseCase.execute(id, negocio_id, sucursal_id, usuario_id, pin_sucursal, ip.toString());
            res.status(200).json(Respuesta.exito('Caja asociada al dispositivo con éxito', caja));
        } catch (error) {
            next(error);
        }
    }

    desasociarDispositivo = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const usuario = this.obtenerEntorno(res);
            const { negocio_id, sucursal_id } = usuario;
            const token_autorizado = typeof req.body?.token_autorizado === 'string' ? req.body.token_autorizado.trim() : '';

            if (!token_autorizado && !usuario.permisos?.includes('ADMIN_SUCURSAL')) {
                throw new AppError('El token de autorización es requerido', 'TOKEN_REQUERIDO', 400);
            }

            await this.desasociarDispositivoCajaUseCase.execute(id, negocio_id, sucursal_id, token_autorizado || null);
            res.status(200).json(Respuesta.exito('Caja desasociada del dispositivo con éxito', null));
        } catch (error) {
            next(error);
        }
    }

    historial = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const { limit, offset, q, fecha_inicio, fecha_fin, origen_tipos } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            
            // Si origen_tipos es un string, lo convertimos a array. Si es array, lo dejamos.
            let origenes: any[] | undefined = undefined;
            if (origen_tipos) {
                if (Array.isArray(origen_tipos)) {
                    origenes = origen_tipos;
                } else if (typeof origen_tipos === 'string') {
                    origenes = origen_tipos.split(',');
                }
            }

            const { total, data } = await this.listarHistorialCajaUseCase.execute(
                id, negocio_id, sucursal_id, { page, perPage: limit }, q, fecha_inicio, fecha_fin, origenes
            );
            res.status(200).json(Respuesta.paginacion('Historial obtenido con éxito', data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

}
