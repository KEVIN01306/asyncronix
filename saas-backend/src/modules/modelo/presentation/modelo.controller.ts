import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerModelosUseCase } from "../application/obtener-modelos.usecase.js";
import type { ObtenerModeloUseCase } from "../application/obtener-modelo.usecase.js";

export class ModeloController extends BaseController {
    constructor(
        private readonly obtenerModeloUseCase: ObtenerModeloUseCase,
        private readonly obtenerModelosUseCase: ObtenerModelosUseCase
    ) { super(); }

    listar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const parseIds = (value: string | string[] | undefined) => {
                if (!value) return undefined;
                return Array.isArray(value) ? value : [value];
            };

            const filters: any = {
                marca_id: parseIds(req.query.marca_id as any),
                linea_id: parseIds(req.query.linea_id as any),
                cilindrada_id: parseIds(req.query.cilindrada_id as any),
            };

            const { total, data } = await this.obtenerModelosUseCase.execute(page, limit as number, filters) as any;
            res.status(200).json(Respuesta.paginacion('Modelos obtenidos con éxito', data, total, limit as number, offset as number));
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
}
