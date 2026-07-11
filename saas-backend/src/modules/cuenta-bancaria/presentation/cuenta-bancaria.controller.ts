import type { NextFunction, Request, Response } from 'express';
import BaseController from '@shared/presentation/base.controller.js';
import Respuesta from '@app/http/respuesta.js';
import type { ObtenerCuentaBancariaUseCase } from '../application/obtener-cuenta-bancaria.usecase.js';
import type { ObtenerCuentasBancariasUseCase } from '../application/obtener-cuentas-bancarias.usecase.js';
import type { RegistrarCuentaBancariaUseCase } from '../application/registrar-cuenta-bancaria.usecase.js';
import type { ActualizarCuentaBancariaUseCase } from '../application/actualizar-cuenta-bancaria.usecase.js';
import type { EliminarCuentaBancariaUseCase } from '../application/eliminar-cuenta-bancaria.usecase.js';
import type { ListarHistorialCuentaBancariaUseCase } from '../application/listar-historial-cuenta-bancaria.usecase.js';

export class CuentaBancariaController extends BaseController {
    constructor(
        private readonly obtenerCuentaBancariaUseCase: ObtenerCuentaBancariaUseCase,
        private readonly obtenerCuentasBancariasUseCase: ObtenerCuentasBancariasUseCase,
        private readonly registrarCuentaBancariaUseCase: RegistrarCuentaBancariaUseCase,
        private readonly actualizarCuentaBancariaUseCase: ActualizarCuentaBancariaUseCase,
        private readonly eliminarCuentaBancariaUseCase: EliminarCuentaBancariaUseCase,
        private readonly listarHistorialCuentaBancariaUseCase: ListarHistorialCuentaBancariaUseCase
    ) {
        super();
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { limit, offset, q } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerCuentasBancariasUseCase.execute(negocio_id, page, limit, q);
            res.status(200).json(Respuesta.paginacion('Cuentas bancarias obtenidas con éxito', data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const cuenta = await this.obtenerCuentaBancariaUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Cuenta bancaria obtenida con éxito', cuenta));
        } catch (error) {
            next(error);
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const cuenta = await this.registrarCuentaBancariaUseCase.execute(req.body, negocio_id);
            res.status(201).json(Respuesta.exito('Cuenta bancaria creada con éxito', cuenta));
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const cuenta = await this.actualizarCuentaBancariaUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Cuenta bancaria actualizada con éxito', cuenta));
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarCuentaBancariaUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Cuenta bancaria eliminada con éxito', null));
        } catch (error) {
            next(error);
        }
    }

    historial = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            // Si la cuenta bancaria puede verse de forma global sin sucursal_id, habría que ajustar el caso de uso
            // O requerir sucursal_id siempre para movimientos de la sucursal actual
            if (!sucursal_id) {
                throw new AppError('Sucursal requerida para obtener historial', 'SUCURSAL_REQUERIDA', 400);
            }
            
            const { limit, offset, q, fecha_inicio, fecha_fin, origen_tipos } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            
            let origenes: any[] | undefined = undefined;
            if (origen_tipos) {
                if (Array.isArray(origen_tipos)) {
                    origenes = origen_tipos;
                } else if (typeof origen_tipos === 'string') {
                    origenes = origen_tipos.split(',');
                }
            }

            const { total, data } = await this.listarHistorialCuentaBancariaUseCase.execute(
                id, negocio_id, sucursal_id, { page, perPage: limit }, q, fecha_inicio, fecha_fin, origenes
            );
            res.status(200).json(Respuesta.paginacion('Historial obtenido con éxito', data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }
}
