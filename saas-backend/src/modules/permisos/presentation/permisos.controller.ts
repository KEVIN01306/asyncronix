import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerModulosUseCase } from "../application/obtener-modulos.usecase.js";
import type { ObtenerPermisosUseCase } from "../application/obtener-permisos.usecase.js";
import type { ObtenerPermisosRolUseCase } from "../application/obtener-permisos-rol.usecase.js";
import type { AsignarPermisosRolUseCase } from "../application/asignar-permisos-rol.usecase.js";

export class PermisosController extends BaseController {
    constructor(
        private readonly obtenerModulosUseCase: ObtenerModulosUseCase,
        private readonly obtenerPermisosUseCase: ObtenerPermisosUseCase,
        private readonly obtenerPermisosRolUseCase: ObtenerPermisosRolUseCase,
        private readonly asignarPermisosRolUseCase: AsignarPermisosRolUseCase
    ) {
        super();
    }

    listarModulos = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { page = 1, perPage = 1000 } = req.query as Record<string, string>;
            const modulos = await this.obtenerModulosUseCase.execute(negocio_id, Number(page), Number(perPage));
            res.status(200).json(Respuesta.paginacion('Módulos obtenidos con éxito', modulos.data, modulos.total, modulos.perPage, (modulos.page - 1) * modulos.perPage));
        } catch (error) {
            next(error);
        }
    }

    listarPermisos = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { modulo_id } = req.query as { modulo_id?: string };
            const { page = 1, perPage = 1000 } = req.query as Record<string, string>;
            const permisos = await this.obtenerPermisosUseCase.execute(negocio_id, modulo_id, Number(page), Number(perPage));
            res.status(200).json(Respuesta.paginacion('Permisos obtenidos con éxito', permisos.data, permisos.total, permisos.perPage, (permisos.page - 1) * permisos.perPage));
        } catch (error) {
            next(error);
        }
    }

    listarPermisosRol = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const permisos = await this.obtenerPermisosRolUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Permisos del rol obtenidos con éxito', permisos));
        } catch (error) {
            next(error);
        }
    }

    asignarPermisosRol = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const permisos = await this.asignarPermisosRolUseCase.execute(id, negocio_id, req.body.permisoIds);
            res.status(200).json(Respuesta.exito('Permisos del rol actualizados con éxito', permisos));
        } catch (error) {
            next(error);
        }
    }
}
