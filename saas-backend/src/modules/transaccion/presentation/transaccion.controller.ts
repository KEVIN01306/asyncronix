import type { NextFunction, Request, Response } from 'express';
import BaseController from '@shared/presentation/base.controller.js';
import Respuesta from '@app/http/respuesta.js';
import type { CrearIngresoEgresoUseCase } from '../application/crear-ingreso-egreso.usecase.js';
import type { ObtenerDetalleIngresoEgresoUseCase } from '../application/obtener-detalle-ingreso-egreso.usecase.js';
import type { ListarIngresosEgresosUseCase } from '../application/listar-ingresos-egresos.usecase.js';
import type { ListarHistorialEntidadUseCase } from '../application/listar-historial.usecase.js';
import type { ListarIngresosEgresosFilters } from '../domain/transaccion.repository.js';

export class TransaccionController extends BaseController {
    constructor(
        private readonly crearIngresoEgresoUseCase: CrearIngresoEgresoUseCase,
        private readonly obtenerDetalleIngresoEgresoUseCase: ObtenerDetalleIngresoEgresoUseCase,
        private readonly listarIngresosEgresosUseCase: ListarIngresosEgresosUseCase,
        private readonly listarHistorialEntidadUseCase: ListarHistorialEntidadUseCase
    ) {
        super();
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const query = res.locals.query;
            const page = Math.floor(query.offset / query.limit) + 1;

            const filters: ListarIngresosEgresosFilters = {};
            if (query.q) filters.q = query.q;
            if (query.tipo_movimiento) filters.tipo_movimiento = query.tipo_movimiento;
            if (query.categoria_id) filters.categoria_id = query.categoria_id;
            if (query.entidad_tipo && query.entidad_id) {
                filters.entidad_tipo = query.entidad_tipo;
                filters.entidad_id = query.entidad_id;
            }
            if (query.fecha_inicio) filters.fecha_inicio = query.fecha_inicio;
            if (query.fecha_fin) filters.fecha_fin = query.fecha_fin;

            const result = await this.listarIngresosEgresosUseCase.execute(
                negocio_id,
                sucursal_id,
                page,
                query.limit,
                filters
            );

            res.status(200).json(
                Respuesta.paginacion(
                    'Ingresos y Egresos obtenidos con éxito',
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

            const ingresoEgreso = await this.obtenerDetalleIngresoEgresoUseCase.execute(
                id,
                negocio_id,
                sucursal_id
            );

            res.status(200).json(Respuesta.exito('Ingreso/Egreso obtenido con éxito', ingresoEgreso));
        } catch (error) {
            next(error);
        }
    };

    crear = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id, id: usuario_id } = this.obtenerEntorno(res);

            const ingresoEgreso = await this.crearIngresoEgresoUseCase.execute(
                req.body,
                negocio_id,
                sucursal_id,
                usuario_id
            );

            res.status(201).json(Respuesta.exito('Ingreso/Egreso creado con éxito', ingresoEgreso));
        } catch (error) {
            next(error);
        }
    };

    historialCaja = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const query = res.locals.query;
            const page = Math.floor(query.offset / query.limit) + 1;

            const filters = {
                q: query.q,
                fecha_inicio: query.fecha_inicio ? new Date(query.fecha_inicio) : undefined,
                fecha_fin: query.fecha_fin ? new Date(query.fecha_fin) : undefined,
                tipo_movimiento: query.tipo_movimiento,
                origen_tipos: query.origen_tipos
            };

            const result = await this.listarHistorialEntidadUseCase.execute(
                negocio_id,
                sucursal_id,
                'CAJA',
                id,
                page,
                query.limit,
                filters
            );

            res.status(200).json(
                Respuesta.paginacion(
                    'Historial de caja obtenido con éxito',
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

    historialCuenta = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const query = res.locals.query;
            const page = Math.floor(query.offset / query.limit) + 1;

            const filters = {
                q: query.q,
                fecha_inicio: query.fecha_inicio ? new Date(query.fecha_inicio) : undefined,
                fecha_fin: query.fecha_fin ? new Date(query.fecha_fin) : undefined,
                tipo_movimiento: query.tipo_movimiento,
                origen_tipos: query.origen_tipos
            };

            const result = await this.listarHistorialEntidadUseCase.execute(
                negocio_id,
                sucursal_id,
                'CUENTA',
                id,
                page,
                query.limit,
                filters
            );

            res.status(200).json(
                Respuesta.paginacion(
                    'Historial de cuenta obtenido con éxito',
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
}
