import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerLineasUseCase } from "../application/obtener-lineas.usecase.js";
import type { ObtenerLineaUseCase } from "../application/obtener-linea.usecase.js";

export class LineaController extends BaseController {
    constructor(
        private readonly obtenerLineaUseCase: ObtenerLineaUseCase,
        private readonly obtenerLineasUseCase: ObtenerLineasUseCase
    ) { super(); }

    listar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, offset } = res.locals.query;
            const q = (req.query.q as string | undefined)?.trim();
            const page = Math.floor(offset / limit) + 1;
            const filters = q ? { q } : undefined;
            const { total, data } = await this.obtenerLineasUseCase.execute(page, limit as number, filters) as any;
            res.status(200).json(Respuesta.paginacion('Lineas obtenidas con éxito', data, total, limit as number, offset as number));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const linea = await this.obtenerLineaUseCase.execute(id);
            res.status(200).json(Respuesta.exito('Linea obtenida con éxito', linea));
        } catch (error) {
            next(error);
        }
    }
}
