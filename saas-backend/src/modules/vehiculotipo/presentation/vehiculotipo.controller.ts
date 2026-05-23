import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerVehiculoTiposUseCase } from "../application/obtener-vehiculotipos.usecase.js";

export class VehiculoTipoController extends BaseController {
    constructor(private readonly obtenerVehiculoTiposUseCase: ObtenerVehiculoTiposUseCase) { super(); }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerVehiculoTiposUseCase.execute(page, limit as number) as any;
            res.status(200).json(Respuesta.paginacion('Tipos de vehículo obtenidos', data, total, limit as number, offset as number));
        } catch (error) { next(error); }
    }
}
