import type { NextFunction, Request, Response } from 'express';
import BaseController from '@shared/presentation/base.controller.js';
import Respuesta from '@app/http/respuesta.js';
import type { CrearMovimientoInternoUseCase } from '../application/crear-movimiento-interno.usecase.js';
import type { ListarMovimientosInternosUseCase } from '../application/listar-movimientos-internos.usecase.js';
import type { ObtenerDetalleMovimientoInternoUseCase } from '../application/obtener-detalle-movimiento-interno.usecase.js';
import AppError from '@shared/errors/AppError.js';

export class MovimientoInternoController extends BaseController {
    constructor(
        private readonly crearMovimientoUseCase: CrearMovimientoInternoUseCase,
        private readonly listarMovimientosUseCase: ListarMovimientosInternosUseCase,
        private readonly obtenerDetalleUseCase: ObtenerDetalleMovimientoInternoUseCase
    ) {
        super();
    }

    crear = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id, id: usuario_id } = this.obtenerEntorno(res);
            const data = req.body;

            const movimiento = await this.crearMovimientoUseCase.execute(
                data,
                negocio_id,
                sucursal_id,
                usuario_id
            );

            res.status(201).json(Respuesta.exito('Movimiento interno creado correctamente', movimiento));
        } catch (error) {
            next(error);
        }
    };

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const query = res.locals.query;
            const page = Math.floor(query.offset / query.limit) + 1;

            const filters = {
                q: query.q,
                entidad_tipo: query.entidad_tipo,
                entidad_id: query.entidad_id,
                fecha_inicio: query.fecha_inicio ? new Date(query.fecha_inicio) : undefined,
                fecha_fin: query.fecha_fin ? new Date(query.fecha_fin) : undefined,
            };

            const result = await this.listarMovimientosUseCase.execute(
                negocio_id,
                sucursal_id,
                { page, perPage: query.limit },
                filters
            );

            res.status(200).json(
                Respuesta.paginacion(
                    'Movimientos internos listados',
                    result.data,
                    result.total,
                    query.limit,
                    query.offset
                )
            );
        } catch (error) {
            next(error);
        }
    };

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);

            if (!id) throw new AppError('ID es requerido', 'INVALID_ID', 400);

            const movimiento = await this.obtenerDetalleUseCase.execute(
                id,
                negocio_id,
                sucursal_id
            );

            res.status(200).json(Respuesta.exito('Detalle de movimiento interno', movimiento));
        } catch (error) {
            next(error);
        }
    };
}
