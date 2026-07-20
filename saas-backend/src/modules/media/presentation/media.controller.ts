import type { Request, Response } from "express";
import type { ListarMediasUseCase } from "../application/listar-medias.usecase.js";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";

export class MediaController extends BaseController {
    constructor(private readonly listarMediasUseCase: ListarMediasUseCase) {
        super()
    }

    async listar(req: Request, res: Response): Promise<void> {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const page = parseInt(req.query.page as string) || 1;
            const perPage = parseInt(req.query.perPage as string) || 10;

            const result = await this.listarMediasUseCase.execute(negocio_id, page, perPage);
            res.json(Respuesta.paginacion('Medias obtenidas', result.data, result.total, perPage, (page - 1) * perPage));
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
