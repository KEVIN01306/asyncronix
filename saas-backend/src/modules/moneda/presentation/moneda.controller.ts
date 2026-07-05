import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerMonedasUseCase } from "../application/obtener-monedas.usecase.js";
import type { ObtenerMonedaUseCase } from "../application/obtener-moneda.usecase.js";

export class MonedaController extends BaseController {
    constructor(
        private readonly obtenerMonedaUseCase: ObtenerMonedaUseCase,
        private readonly obtenerMonedasUseCase: ObtenerMonedasUseCase
    ) { super(); }

    listar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, offset } = res.locals.query;
            const q = (req.query.q as string | undefined)?.trim();
            const page = Math.floor(offset / limit) + 1;
            const filters = q ? { q } : undefined;
            const { total, data } = await this.obtenerMonedasUseCase.execute(page, limit as number, filters) as any;
            res.status(200).json(Respuesta.paginacion('Monedas obtenidas con éxito', data, total, limit as number, offset as number));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const moneda = await this.obtenerMonedaUseCase.execute(id);
            res.status(200).json(Respuesta.exito('Moneda obtenida con éxito', moneda));
        } catch (error) {
            next(error);
        }
    }
}
