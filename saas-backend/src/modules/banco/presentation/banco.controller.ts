import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";
import type { ObtenerBancosUseCase } from "../application/obtener-bancos.usecase.js";
import type { ObtenerBancoUseCase } from "../application/obtener-banco.usecase.js";

export class BancoController extends BaseController {
    constructor(
        private readonly obtenerBancosUseCase: ObtenerBancosUseCase,
        private readonly obtenerBancoUseCase: ObtenerBancoUseCase
    ) { super(); }

    listar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, offset } = res.locals.query;
            const q = (req.query.q as string | undefined)?.trim();
            const page = Math.floor(offset / limit) + 1;
            const filters = q ? { q } : undefined;
            const { total, data } = await this.obtenerBancosUseCase.execute(page, limit as number, filters) as any;
            res.status(200).json(Respuesta.paginacion('Bancos obtenidos con éxito', data, total, limit as number, offset as number));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const banco = await this.obtenerBancoUseCase.execute(id);
            res.status(200).json(Respuesta.exito('Banco obtenido con éxito', banco));
        } catch (error) {
            next(error);
        }
    }
}
