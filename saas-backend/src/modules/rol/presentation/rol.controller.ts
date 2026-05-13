import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ActualizarRolUseCase } from "../application/actualizar-rol.usecase.js";
import type { EliminarRolUseCase } from "../application/eliminar-rol.usecase.js";
import type { ObtenerRolUseCase } from "../application/obtener-rol.usecase.js";
import type { ObtenerRolesUseCase } from "../application/obtener-roles.usecase.js";
import type { RegistrarRolUseCase } from "../application/registrar-rol.usecase.js";

export class RolController extends BaseController {

    constructor(
        private readonly obtenerRolUseCase: ObtenerRolUseCase,
        private readonly obtenerRolesUseCase: ObtenerRolesUseCase,
        private readonly registrarRolUseCase: RegistrarRolUseCase,
        private readonly actualizarRolUseCase: ActualizarRolUseCase,
        private readonly eliminarRolUseCase: EliminarRolUseCase
    ) {
        super()
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            const rol = await this.obtenerRolUseCase.execute({ id, negocio_id })
            res.status(200).json(Respuesta.exito('Rol obtenido con exito', rol))
        } catch (error) {
            next(error)
        }
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const { limit, offset } = res.locals.query
            const page = offset / limit + 1
            const { total, data } = await this.obtenerRolesUseCase.execute({ negocio_id, page, perPage: limit })
            res.status(200).json(Respuesta.paginacion('Roles obtenidos con exito', data, total, limit, offset))
        } catch (error) {
            next(error)
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const rol = await this.registrarRolUseCase.execute(req.body, negocio_id)
            res.status(201).json(Respuesta.exito('Rol creado con exito', rol))
        } catch (error) {
            next(error)
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            const rol = await this.actualizarRolUseCase.execute(id, negocio_id, req.body)
            res.status(200).json(Respuesta.exito('Rol actualizado con exito', rol))
        } catch (error) {
            next(error)
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            await this.eliminarRolUseCase.execute(id, negocio_id)
            res.status(204).json(Respuesta.exito('Rol eliminado con exito', null))
        } catch (error) {
            next(error)
        }
    }
}
