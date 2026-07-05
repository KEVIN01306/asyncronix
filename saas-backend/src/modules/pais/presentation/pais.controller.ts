import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerPaisesUseCase } from "../application/obtener-paises.usecase.js";
import type { ObtenerPaisUseCase } from "../application/obtener-pais.usecase.js";

export class PaisController extends BaseController {
    constructor(
        private readonly obtenerPaisUseCase: ObtenerPaisUseCase,
        private readonly obtenerPaisesUseCase: ObtenerPaisesUseCase
    ) { super(); }

    listar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, offset } = res.locals.query;
            const q = (req.query.q as string | undefined)?.trim();
            const page = Math.floor(offset / limit) + 1;
            const filters = q ? { q } : undefined;
            const { total, data } = await this.obtenerPaisesUseCase.execute(page, limit as number, filters) as any;
            res.status(200).json(Respuesta.paginacion('Países obtenidos con éxito', data, total, limit as number, offset as number));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const pais = await this.obtenerPaisUseCase.execute(id);
            res.status(200).json(Respuesta.exito('País obtenido con éxito', pais));
        } catch (error) {
            next(error);
        }
    }
}
