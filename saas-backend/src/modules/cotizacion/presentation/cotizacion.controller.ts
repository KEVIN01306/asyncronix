import type { Request, Response, NextFunction } from "express";
import BaseController from '@shared/presentation/base.controller.js';
import Respuesta from '@app/http/respuesta.js';
import { CrearCotizacionUseCase } from "../application/crear-cotizacion.usecase.js";
import { ObtenerCotizacionesUseCase } from "../application/obtener-cotizaciones.usecase.js";
import { ObtenerCotizacionUseCase } from "../application/obtener-cotizacion.usecase.js";
import { ActualizarEstadoCotizacionUseCase } from "../application/actualizar-estado-cotizacion.usecase.js";
import { ConvertirCotizacionUseCase } from "../application/convertir-cotizacion.usecase.js";

export class CotizacionController extends BaseController {
    constructor(
        private readonly crearUseCase: CrearCotizacionUseCase,
        private readonly obtenerCotizacionesUseCase: ObtenerCotizacionesUseCase,
        private readonly obtenerCotizacionUseCase: ObtenerCotizacionUseCase,
        private readonly actualizarEstadoUseCase: ActualizarEstadoCotizacionUseCase,
        private readonly convertirUseCase: ConvertirCotizacionUseCase
    ) {
        super();
    }

    crear = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const { negocio_id, sucursal_id, id: usuario_id } = this.obtenerEntorno(res);
            
            const result = await this.crearUseCase.execute(data as any, negocio_id, sucursal_id, usuario_id);
            res.status(201).json(Respuesta.exito('Cotización creada exitosamente', result));
        } catch (error) {
            next(error);
        }
    };

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const query = res.locals.query;
            const page = Math.floor(query.offset / query.limit) + 1;
            
            const pagination = {
                page,
                perPage: query.limit
            };
            
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            
            const result = await this.obtenerCotizacionesUseCase.execute(
                negocio_id, 
                sucursal_id, 
                pagination, 
                query.q, 
                query.estado, 
                query.cliente_id
            );
            
            res.status(200).json(
                Respuesta.paginacion(
                    'Cotizaciones obtenidas con éxito',
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

    obtener = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            
            const result = await this.obtenerCotizacionUseCase.execute(id, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito('Cotización obtenida con éxito', result));
        } catch (error) {
            next(error);
        }
    };

    actualizarEstado = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            
            const result = await this.actualizarEstadoUseCase.execute(id, estado, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito('Estado actualizado correctamente', result));
        } catch (error) {
            next(error);
        }
    };

    convertir = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const options = req.body;
            const { negocio_id, sucursal_id, id: usuario_id } = this.obtenerEntorno(res);
            
            const result = await this.convertirUseCase.execute(
                id, 
                negocio_id, 
                sucursal_id, 
                usuario_id, 
                options.metodo_pago, 
                options.opcionesCaja,
                options.ignoreStock,
                options.tipo_servicio_id
            );
            res.status(200).json(Respuesta.exito('Cotización convertida exitosamente', result));
        } catch (error) {
            next(error);
        }
    };
}
