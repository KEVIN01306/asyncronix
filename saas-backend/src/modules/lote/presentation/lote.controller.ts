import type { NextFunction, Request, Response } from 'express';
import BaseController from '@shared/presentation/base.controller.js';
import Respuesta from '@app/http/respuesta.js';
import type { RegistrarLoteUseCase } from '../application/registrar-lote.usecase.js';
import type { ObtenerLoteUseCase } from '../application/obtener-lote.usecase.js';
import type { ObtenerLotesUseCase } from '../application/obtener-lotes.usecase.js';
import type { ListarLotesUseCase } from '../application/listar-lotes.usecase.js';
import type { ListarLotesPorProductoUseCase } from '../application/listar-lotes-por-producto.usecase.js';

export class LoteController extends BaseController {
    constructor(
        private readonly registrarLoteUseCase: RegistrarLoteUseCase,
        private readonly obtenerLoteUseCase: ObtenerLoteUseCase,
        private readonly obtenerLotesUseCase: ObtenerLotesUseCase,
        private readonly listarLotesUseCase: ListarLotesUseCase,
        private readonly listarPorProductoUseCase: ListarLotesPorProductoUseCase
    ) { super(); }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const payload = req.body;
            const created = await this.registrarLoteUseCase.execute(payload, negocio_id);
            res.status(201).json(Respuesta.exito('Lote creado con exito', created));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const lote = await this.obtenerLoteUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Lote obtenido con exito', lote));
        } catch (error) {
            next(error);
        }
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const query = res.locals.query as any;
            const { limit, offset } = query;
            const page = Math.floor(offset / limit) + 1;
            const filters = {
                q: query.q,
                codigo_lote: query.codigo_lote,
                producto_codigo: query.producto_codigo,
                codigo_secuencial: query.codigo_secuencial,
                fecha_vencimiento_from: query.fecha_vencimiento_from,
                fecha_vencimiento_to: query.fecha_vencimiento_to,
                created_at_from: query.created_at_from,
                created_at_to: query.created_at_to,
            };

            const { total, data } = await this.listarLotesUseCase.execute(negocio_id, sucursal_id, { page, perPage: limit }, filters);
            res.status(200).json(Respuesta.paginacion('Lotes obtenidos con exito', data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

    listarPorVariante = async (req: Request<{ variante_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { variante_id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const result = await this.obtenerLotesUseCase.execute(variante_id, negocio_id, { page, perPage: limit }, sucursal_id);
            const { total, data, stock } = result;
            const response = Respuesta.paginacion('Lotes obtenidos con exito', data, total, limit, offset) as any;
            if (typeof stock === 'number') response.stock = stock;
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    listarPorProducto = async (req: Request<{ producto_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { producto_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.listarPorProductoUseCase.execute(producto_id, negocio_id, { page, perPage: limit });
            res.status(200).json(Respuesta.paginacion('Lotes obtenidos con exito', data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }
}
