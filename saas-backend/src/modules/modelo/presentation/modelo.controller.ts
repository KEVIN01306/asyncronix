import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerModelosUseCase } from "../application/obtener-modelos.usecase.js";
import type { ObtenerModeloUseCase } from "../application/obtener-modelo.usecase.js";
import type { CrearModeloPorPinUseCase } from "../application/crear-modelo-por-pin.usecase.js";

export class ModeloController extends BaseController {
    constructor(
        private readonly obtenerModeloUseCase: ObtenerModeloUseCase,
        private readonly obtenerModelosUseCase: ObtenerModelosUseCase,
        private readonly crearModeloPorPinUseCase: CrearModeloPorPinUseCase,
    ) { super(); }

    listar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { offset } = res.locals.query;
            const parseIds = (value: string | string[] | undefined) => {
                if (!value) return undefined;
                return Array.isArray(value) ? value : [value];
            };

            const q = (req.query.q as string | undefined)?.trim();
            const filters: any = {
                marca_id: parseIds(req.query.marca_id as any),
                linea_id: parseIds(req.query.linea_id as any),
                cilindrada_id: parseIds(req.query.cilindrada_id as any),
            };

            if (q) filters.q = q;

            const perPage = 10; // catalogue searches should return a small set
            const page = Math.floor(offset / perPage) + 1;
            const { total, data } = await this.obtenerModelosUseCase.execute(page, perPage, filters) as any;
            res.status(200).json(Respuesta.paginacion('Modelos obtenidos con éxito', data, total, perPage, offset as number));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const modelo = await this.obtenerModeloUseCase.execute(id);
            res.status(200).json(Respuesta.exito('Modelo obtenido con éxito', modelo));
        } catch (error) {
            next(error);
        }
    }

    crearPorPin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const created = await this.crearModeloPorPinUseCase.execute(req.body, { negocio_id, sucursal_id });
            res.status(201).json(Respuesta.exito('Modelo creado con éxito', created));
        } catch (error) {
            next(error);
        }
    }
}
