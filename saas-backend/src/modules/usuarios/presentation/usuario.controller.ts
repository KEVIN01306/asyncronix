import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerUsuarioUseCase } from "../application/obtener-usuario.usecase.js";
import type { ObtenerUsuariosUseCase } from "../application/obtener-usuarios.usecase.js";
import type { RegistrarUsuarioUseCase } from "../application/registrar-usuario.usecase.js";
import type { ActualizarUsuarioUseCase } from "../application/actualizar-usuario.usecase.js";
import type { EliminarUsuarioUseCase } from "../application/eliminar-usuario.usecase.js";


export class UsuarioController extends BaseController {

    constructor(
        private readonly obtenerUsuarioUseCase: ObtenerUsuarioUseCase,
        private readonly obtenerUsuariosUseCase: ObtenerUsuariosUseCase,
        private readonly registrarUsuarioUseCase: RegistrarUsuarioUseCase,
        private readonly actualizarUsuarioUseCase: ActualizarUsuarioUseCase,
        private readonly eliminarUsuarioUseCase: EliminarUsuarioUseCase
    ) {
        super()
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            const usuario = await this.obtenerUsuarioUseCase.execute({ id, negocio_id });
            res.status(200).json(Respuesta.exito('Usuario obtenido con exito', usuario))
        } catch (error) {
            next(error)
        }
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const { limit, offset } = res.locals.query
            const page = offset / limit + 1
            const { total, usuarios } = await this.obtenerUsuariosUseCase.execute({ negocio_id, page, perPage: limit });
            res.status(200).json(Respuesta.paginacion('Usuarios Obtenidos con exito', usuarios, total, limit, offset))
        } catch (error) {
            next(error)
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const usuario = await this.registrarUsuarioUseCase.execute(req.body, negocio_id)
            res.status(201).json(Respuesta.exito('Usuario creado con exito', usuario))
        } catch (error) {
            next(error)
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            const usuario = await this.actualizarUsuarioUseCase.execute(id, negocio_id, req.body)
            res.status(200).json(Respuesta.exito('Usuario actualizado con exito', usuario))
        } catch (error) {
            next(error)
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            await this.eliminarUsuarioUseCase.execute(id, negocio_id)
            res.status(204).json(Respuesta.exito('Usuario eliminado con exito', null))
        } catch (error) {
            next(error)
        }
    }
}