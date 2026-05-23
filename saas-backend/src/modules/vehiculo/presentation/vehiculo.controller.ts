import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";
import type { ObtenerVehiculosUseCase } from "../application/obtener-vehiculos.usecase.js";
import type { ObtenerVehiculoUseCase } from "../application/obtener-vehiculo.usecase.js";
import type { RegistrarVehiculoUseCase } from "../application/registrar-vehiculo.usecase.js";
import type { ActualizarVehiculoUseCase } from "../application/actualizar-vehiculo.usecase.js";
import type { SubirAvatarVehiculoUseCase } from "../application/subir-avatar.usecase.js";
import type { SubirCalcomaniaVehiculoUseCase } from "../application/subir-calcomania.usecase.js";
import AppError from "@shared/errors/AppError.js";

export class VehiculoController extends BaseController {
    constructor(
        private readonly obtenerVehiculosUseCase: ObtenerVehiculosUseCase,
        private readonly obtenerVehiculoUseCase: ObtenerVehiculoUseCase,
        private readonly registrarVehiculoUseCase: RegistrarVehiculoUseCase,
        private readonly actualizarVehiculoUseCase: ActualizarVehiculoUseCase,
        private readonly subirAvatarUseCase: SubirAvatarVehiculoUseCase,
        private readonly subirCalcomaniaUseCase: SubirCalcomaniaVehiculoUseCase
    ) { super(); }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const result = await this.obtenerVehiculosUseCase.execute(negocio_id, page, limit as number) as any;
            res.status(200).json(Respuesta.paginacion('Vehículos obtenidos', result.data, result.total, limit as number, offset as number));
        } catch (error) { next(error); }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const v = await this.obtenerVehiculoUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Vehículo obtenido', v));
        } catch (error) { next(error); }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const created = await this.registrarVehiculoUseCase.execute(req.body, negocio_id);
            res.status(201).json(Respuesta.exito('Vehículo creado', created));
        } catch (error) { next(error); }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const updated = await this.actualizarVehiculoUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Vehículo actualizado', updated));
        } catch (error) { next(error); }
    }

    subirAvatar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            if (!req.file) throw new AppError('No se ha subido ninguna imagen', 'IMAGE_REQUIRED', 400);
            const avatar_url = req.file.path.replace(/\\/g, '/');
            await this.subirAvatarUseCase.execute(id, negocio_id, avatar_url);
            res.status(200).json(Respuesta.exito('Avatar actualizado', null));
        } catch (error) { next(error); }
    }

    subirCalcomania = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            if (!req.file) throw new AppError('No se ha subido ninguna imagen', 'FILE_REQUIRED', 400);
            const url = req.file.path.replace(/\\/g, '/');
            await this.subirCalcomaniaUseCase.execute(id, negocio_id, url);
            res.status(200).json(Respuesta.exito('Calcomanía actualizada', null));
        } catch (error) { next(error); }
    }
}
