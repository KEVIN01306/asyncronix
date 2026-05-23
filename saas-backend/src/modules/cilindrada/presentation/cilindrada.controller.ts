import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerCilindradaUseCase } from "../application/obtener-cilindrada.usecase.js";
import type { ObtenerCilindradasUseCase } from "../application/obtener-cilindradas.usecase.js";

export class CilindradaController extends BaseController {
    constructor(
        private readonly obtenerCilindradaUseCase: ObtenerCilindradaUseCase,
        private readonly obtenerCilindradasUseCase: ObtenerCilindradasUseCase
    ) { super(); }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerCilindradasUseCase.execute(page, limit as number) as any;
            res.status(200).json(Respuesta.paginacion('Cilindradas obtenidas con éxito', data, total, limit as number, offset as number));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const cilindrada = await this.obtenerCilindradaUseCase.execute(id);
            res.status(200).json(Respuesta.exito('Cilindrada obtenida con éxito', cilindrada));
        } catch (error) {
            next(error);
        }
    }
}
