import type { NextFunction, Request, Response } from 'express';
import BaseController from '@shared/presentation/base.controller.js';
import Respuesta from '@app/http/respuesta.js';
import type { ObtenerCuentaBancariaUseCase } from '../application/obtener-cuenta-bancaria.usecase.js';
import type { ObtenerCuentasBancariasUseCase } from '../application/obtener-cuentas-bancarias.usecase.js';
import type { RegistrarCuentaBancariaUseCase } from '../application/registrar-cuenta-bancaria.usecase.js';
import type { ActualizarCuentaBancariaUseCase } from '../application/actualizar-cuenta-bancaria.usecase.js';
import type { EliminarCuentaBancariaUseCase } from '../application/eliminar-cuenta-bancaria.usecase.js';

export class CuentaBancariaController extends BaseController {
    constructor(
        private readonly obtenerCuentaBancariaUseCase: ObtenerCuentaBancariaUseCase,
        private readonly obtenerCuentasBancariasUseCase: ObtenerCuentasBancariasUseCase,
        private readonly registrarCuentaBancariaUseCase: RegistrarCuentaBancariaUseCase,
        private readonly actualizarCuentaBancariaUseCase: ActualizarCuentaBancariaUseCase,
        private readonly eliminarCuentaBancariaUseCase: EliminarCuentaBancariaUseCase
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
}
