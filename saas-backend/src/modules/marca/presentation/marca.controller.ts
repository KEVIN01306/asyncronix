import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerMarcasUseCase } from "../application/obtener-marcas.usecase.js";
import type { ObtenerMarcaUseCase } from "../application/obtener-marca.usecase.js";

export class MarcaController extends BaseController {
    constructor(
        private readonly obtenerMarcaUseCase: ObtenerMarcaUseCase,
        private readonly obtenerMarcasUseCase: ObtenerMarcasUseCase
    ) { super(); }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerMarcasUseCase.execute(page, limit as number) as any;
            res.status(200).json(Respuesta.paginacion('Marcas obtenidas con éxito', data, total, limit as number, offset as number));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const marca = await this.obtenerMarcaUseCase.execute(id);
            res.status(200).json(Respuesta.exito('Marca obtenida con éxito', marca));
        } catch (error) {
            next(error);
        }
    }
}
