import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";
import type { ObtenerCategoriaUseCase } from "../application/obtener-categoria.usecase.js";
import type { ObtenerCategoriasUseCase } from "../application/obtener-categorias.usecase.js";
import type { RegistrarCategoriaUseCase } from "../application/registrar-categoria.usecase.js";
import type { ActualizarCategoriaUseCase } from "../application/actualizar-categoria.usecase.js";
import type { EliminarCategoriaUseCase } from "../application/eliminar-categoria.usecase.js";

export class CategoriaController extends BaseController {
    constructor(
        private readonly obtenerCategoriaUseCase: ObtenerCategoriaUseCase,
        private readonly obtenerCategoriasUseCase: ObtenerCategoriasUseCase,
        private readonly registrarCategoriaUseCase: RegistrarCategoriaUseCase,
        private readonly actualizarCategoriaUseCase: ActualizarCategoriaUseCase,
        private readonly eliminarCategoriaUseCase: EliminarCategoriaUseCase
    ) {
        super();
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const categoria = await this.obtenerCategoriaUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Categoria obtenida con exito', categoria));
        } catch (error) {
            next(error);
        }
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerCategoriasUseCase.execute(negocio_id, { page, perPage: limit });
            res.status(200).json(Respuesta.paginacion('Categorias obtenidas con exito', data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const categoria = await this.registrarCategoriaUseCase.execute(req.body, negocio_id);
            res.status(201).json(Respuesta.exito('Categoria creada con exito', categoria));
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const categoria = await this.actualizarCategoriaUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Categoria actualizada con exito', categoria));
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarCategoriaUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Categoria eliminada con exito', null));
        } catch (error) {
            next(error);
        }
    }
}
