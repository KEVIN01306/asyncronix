import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";
import type { ObtenerOpcionServicioUseCase } from "../application/obtener-opcion-servicio.usecase.js";
import type { ObtenerOpcionesServicioUseCase } from "../application/obtener-opciones-servicio.usecase.js";
import type { RegistrarOpcionServicioUseCase } from "../application/registrar-opcion-servicio.usecase.js";
import type { ActualizarOpcionServicioUseCase } from "../application/actualizar-opcion-servicio.usecase.js";
import type { EliminarOpcionServicioUseCase } from "../application/eliminar-opcion-servicio.usecase.js";

export class OpcionServicioController extends BaseController {
    constructor(
        private readonly obtenerOpcionServicioUseCase: ObtenerOpcionServicioUseCase,
        private readonly obtenerOpcionesServicioUseCase: ObtenerOpcionesServicioUseCase,
        private readonly registrarOpcionServicioUseCase: RegistrarOpcionServicioUseCase,
        private readonly actualizarOpcionServicioUseCase: ActualizarOpcionServicioUseCase,
        private readonly eliminarOpcionServicioUseCase: EliminarOpcionServicioUseCase
    ) {
        super();
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerOpcionesServicioUseCase.execute(negocio_id, page, limit);
            res.status(200).json(Respuesta.paginacion('Opciones de servicio obtenidas con éxito', data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const opcion = await this.obtenerOpcionServicioUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Opción de servicio obtenida con éxito', opcion));
        } catch (error) {
            next(error);
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const opcion = await this.registrarOpcionServicioUseCase.execute(req.body, negocio_id);
            res.status(201).json(Respuesta.exito('Opción de servicio creada con éxito', opcion));
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const opcion = await this.actualizarOpcionServicioUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Opción de servicio actualizada con éxito', opcion));
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarOpcionServicioUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Opción de servicio eliminada con éxito', null));
        } catch (error) {
            next(error);
        }
    }
}
