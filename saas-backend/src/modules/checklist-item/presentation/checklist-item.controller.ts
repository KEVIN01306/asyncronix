import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";
import type { ObtenerChecklistItemUseCase } from "../application/obtener-checklist-item.usecase.js";
import type { ObtenerChecklistItemsUseCase } from "../application/obtener-checklist-items.usecase.js";
import type { RegistrarChecklistItemUseCase } from "../application/registrar-checklist-item.usecase.js";
import type { ActualizarChecklistItemUseCase } from "../application/actualizar-checklist-item.usecase.js";
import type { EliminarChecklistItemUseCase } from "../application/eliminar-checklist-item.usecase.js";

export class ChecklistItemController extends BaseController {
    constructor(
        private readonly obtenerChecklistItemUseCase: ObtenerChecklistItemUseCase,
        private readonly obtenerChecklistItemsUseCase: ObtenerChecklistItemsUseCase,
        private readonly registrarChecklistItemUseCase: RegistrarChecklistItemUseCase,
        private readonly actualizarChecklistItemUseCase: ActualizarChecklistItemUseCase,
        private readonly eliminarChecklistItemUseCase: EliminarChecklistItemUseCase
    ) {
        super();
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerChecklistItemsUseCase.execute(negocio_id, page, limit);
            res.status(200).json(Respuesta.paginacion('Checklist items obtenidos con éxito', data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const item = await this.obtenerChecklistItemUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Checklist item obtenido con éxito', item));
        } catch (error) {
            next(error);
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const item = await this.registrarChecklistItemUseCase.execute(req.body, negocio_id);
            res.status(201).json(Respuesta.exito('Checklist item creado con éxito', item));
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const item = await this.actualizarChecklistItemUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Checklist item actualizado con éxito', item));
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarChecklistItemUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Checklist item eliminado con éxito', null));
        } catch (error) {
            next(error);
        }
    }
}
