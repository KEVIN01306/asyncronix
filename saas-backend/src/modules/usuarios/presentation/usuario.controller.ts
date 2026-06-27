import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerUsuarioUseCase } from "../application/obtener-usuario.usecase.js";
import type { ObtenerUsuariosUseCase } from "../application/obtener-usuarios.usecase.js";
import type { RegistrarUsuarioUseCase } from "../application/registrar-usuario.usecase.js";
import type { ActualizarUsuarioUseCase } from "../application/actualizar-usuario.usecase.js";
import type { EliminarUsuarioUseCase } from "../application/eliminar-usuario.usecase.js";
import type { ActualizarPerfilUseCase } from "../application/actualizar-perfil.usecase.js";
import type { ActualizarAvatarUseCase } from "../application/actualizar-avatar.usecase.js";
import type { CambiarPasswordUseCase } from "../application/cambiar-password.usecase.js";
import type { ActualizarPinCajaUseCase } from "../application/actualizar-pin-caja.usecase.js";
import AppError from "../../../shared/errors/AppError.js";

export class UsuarioController extends BaseController {

    constructor(
        private readonly obtenerUsuarioUseCase: ObtenerUsuarioUseCase,
        private readonly obtenerUsuariosUseCase: ObtenerUsuariosUseCase,
        private readonly registrarUsuarioUseCase: RegistrarUsuarioUseCase,
        private readonly actualizarUsuarioUseCase: ActualizarUsuarioUseCase,
        private readonly eliminarUsuarioUseCase: EliminarUsuarioUseCase,
        private readonly actualizarPerfilUseCase: ActualizarPerfilUseCase,
        private readonly actualizarAvatarUseCase: ActualizarAvatarUseCase,
        private readonly cambiarPasswordUseCase: CambiarPasswordUseCase,
        private readonly actualizarPinCajaUseCase: ActualizarPinCajaUseCase
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
            const { limit, offset, q, email, sucursal_id, roles } = res.locals.query
            const page = offset / limit + 1
            const rolesArray = roles ? (String(roles).split(',').map((r: string) => r.trim()).filter(Boolean)) : null
            const { total, usuarios } = await this.obtenerUsuariosUseCase.execute({ negocio_id, page, perPage: limit, q, email, sucursal_id, roles: rolesArray });
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

    obtenerPerfil = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, negocio_id } = this.obtenerEntorno(res)
            const usuario = await this.obtenerUsuarioUseCase.execute({ id, negocio_id });
            res.status(200).json(Respuesta.exito('Perfil obtenido con exito', usuario))
        } catch (error) {
            next(error)
        }
    }

    actualizarPerfil = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, negocio_id } = this.obtenerEntorno(res)
            const usuario = await this.actualizarPerfilUseCase.execute(id, negocio_id, req.body)
            res.status(200).json(Respuesta.exito('Perfil actualizado con exito', usuario))
        } catch (error) {
            next(error)
        }
    }

    actualizarAvatar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, negocio_id } = this.obtenerEntorno(res)
            if (!req.file) {
                throw new AppError('No se ha subido ninguna imagen', 'IMAGE_REQUIRED', 400);
            }
            const avatar_url = req.file.path.replace(/\\/g, '/');

            await this.actualizarAvatarUseCase.execute(id, negocio_id, avatar_url)
            res.status(200).json(Respuesta.exito('Avatar actualizado con exito', null))
        } catch (error) {
            console.log(error)

            next(error)
        }
    }

    cambiarPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, negocio_id } = this.obtenerEntorno(res)
            const { password } = req.body
            await this.cambiarPasswordUseCase.execute(id, negocio_id, password)
            res.status(200).json(Respuesta.exito('Contraseña actualizada con exito', null))
        } catch (error) {
            next(error)
        }
    }

    actualizarPinCaja = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, negocio_id } = this.obtenerEntorno(res)
            const { pin_caja } = req.body
            await this.actualizarPinCajaUseCase.execute(id, negocio_id, pin_caja)
            res.status(200).json(Respuesta.exito('Pin de caja actualizado con exito', null))
        } catch (error) {
            next(error)
        }
    }

    restablecerPasswordUsuario = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            const { password } = req.body
            await this.cambiarPasswordUseCase.execute(id, negocio_id, password)
            res.status(200).json(Respuesta.exito('Contraseña restablecida con exito', null))
        } catch (error) {
            next(error)
        }
    }
}