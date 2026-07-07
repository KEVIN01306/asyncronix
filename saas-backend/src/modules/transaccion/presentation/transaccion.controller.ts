import type { NextFunction, Request, Response } from 'express';
import BaseController from '@shared/presentation/base.controller.js';
import Respuesta from '@app/http/respuesta.js';
import type { CrearMovimientoUseCase } from '../application/crear-movimiento.usecase.js';
import type { ObtenerDetalleMovimientoUseCase } from '../application/obtener-detalle-movimiento.usecase.js';
import type { ListarMovimientosUseCase } from '../application/listar-movimientos.usecase.js';
import type { ListarTransaccionesMovimientosFilters } from '../domain/transaccion.repository.js';

export class TransaccionController extends BaseController {
    constructor(
        private readonly crearMovimientoUseCase: CrearMovimientoUseCase,
        private readonly obtenerDetalleMovimientoUseCase: ObtenerDetalleMovimientoUseCase,
        private readonly listarMovimientosUseCase: ListarMovimientosUseCase
    ) {
        super();
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const query = res.locals.query;
            const page = Math.floor(query.offset / query.limit) + 1;

            const filters: ListarTransaccionesMovimientosFilters = {};
            if (query.q) filters.q = query.q;
            if (query.tipo_movimiento) filters.tipo_movimiento = query.tipo_movimiento;
            if (query.categoria_id) filters.categoria_id = query.categoria_id;
            if (query.entidad_tipo && query.entidad_id) {
                filters.entidad_tipo = query.entidad_tipo;
                filters.entidad_id = query.entidad_id;
            }
            if (query.fecha_inicio) filters.fecha_inicio = query.fecha_inicio;
            if (query.fecha_fin) filters.fecha_fin = query.fecha_fin;

            const result = await this.listarMovimientosUseCase.execute(
                negocio_id,
                sucursal_id,
                page,
                query.limit,
                filters
            );

            res.status(200).json(
                Respuesta.paginacion(
                    'Movimientos obtenidos con éxito',
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

            const movimiento = await this.obtenerDetalleMovimientoUseCase.execute(
                id,
                negocio_id,
                sucursal_id
            );

            res.status(200).json(Respuesta.exito('Movimiento obtenido con éxito', movimiento));
        } catch (error) {
            next(error);
        }
    };

    crear = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id, id: usuario_id } = this.obtenerEntorno(res);

            const movimiento = await this.crearMovimientoUseCase.execute(
                req.body,
                negocio_id,
                sucursal_id,
                usuario_id
            );

            res.status(201).json(Respuesta.exito('Movimiento creado con éxito', movimiento));
        } catch (error) {
            next(error);
        }
    };
}
