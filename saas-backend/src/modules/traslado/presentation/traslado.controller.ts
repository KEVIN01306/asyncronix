import type { NextFunction, Request, Response } from 'express';
import BaseController from '@shared/presentation/base.controller.js';
import Respuesta from '@app/http/respuesta.js';
import type { ListarTrasladosPorOrigenUseCase } from '../application/listar-traslados-por-origen.usecase.js';
import type { ListarTrasladosPorDestinoUseCase } from '../application/listar-traslados-por-destino.usecase.js';
import type { ObtenerTrasladoUseCase } from '../application/obtener-traslado.usecase.js';
import type { CrearTrasladoUseCase } from '../application/crear-traslado.usecase.js';
import type { CancelarTrasladoUseCase } from '../application/cancelar-traslado.usecase.js';
import type { RecibirTrasladoUseCase } from '../application/recibir-traslado.usecase.js';

export class TrasladoController extends BaseController {
    constructor(
        private readonly crearTrasladoUseCase: CrearTrasladoUseCase,
        private readonly obtenerTrasladoUseCase: ObtenerTrasladoUseCase,
        private readonly listarPorOrigenUseCase: ListarTrasladosPorOrigenUseCase,
        private readonly listarPorDestinoUseCase: ListarTrasladosPorDestinoUseCase,
        private readonly cancelarTrasladoUseCase: CancelarTrasladoUseCase,
        private readonly recibirTrasladoUseCase: RecibirTrasladoUseCase,
    ) {
        super();
    }

    listarPorOrigen = async (req: Request<{ origen_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { origen_id } = req.params;
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const result = await this.listarPorOrigenUseCase.execute(negocio_id, origen_id, { page, perPage: limit });
            res.status(200).json(Respuesta.paginacion('Traslados por origen obtenidos con éxito', result.data, result.total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

    listarPorDestino = async (req: Request<{ destino_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { destino_id } = req.params;
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const result = await this.listarPorDestinoUseCase.execute(negocio_id, destino_id, { page, perPage: limit });
            res.status(200).json(Respuesta.paginacion('Traslados por destino obtenidos con éxito', result.data, result.total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const traslado = await this.obtenerTrasladoUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Traslado obtenido con éxito', traslado));
        } catch (error) {
            next(error);
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id, id: usuario_id } = this.obtenerEntorno(res);
            const traslado = await this.crearTrasladoUseCase.execute(req.body, negocio_id, sucursal_id, usuario_id);
            res.status(201).json(Respuesta.exito('Traslado creado con éxito', traslado));
        } catch (error) {
            next(error);
        }
    }

    cancelar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            await this.cancelarTrasladoUseCase.execute(id, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito('Traslado cancelado con éxito', null));
        } catch (error) {
            next(error);
        }
    }

    recibir = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            await this.recibirTrasladoUseCase.execute(id, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito('Traslado recibido con éxito', null));
        } catch (error) {
            next(error);
        }
    }
}
