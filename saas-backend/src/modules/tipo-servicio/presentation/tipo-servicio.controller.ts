import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";
import type { ObtenerTipoServicioUseCase } from "../application/obtener-tipo-servicio.usecase.js";
import type { ObtenerTiposServicioUseCase } from "../application/obtener-tipos-servicio.usecase.js";
import type { RegistrarTipoServicioUseCase } from "../application/registrar-tipo-servicio.usecase.js";
import type { ActualizarTipoServicioUseCase } from "../application/actualizar-tipo-servicio.usecase.js";
import type { EliminarTipoServicioUseCase } from "../application/eliminar-tipo-servicio.usecase.js";

export class TipoServicioController extends BaseController {
    constructor(
        private readonly obtenerTipoServicioUseCase: ObtenerTipoServicioUseCase,
        private readonly obtenerTiposServicioUseCase: ObtenerTiposServicioUseCase,
        private readonly registrarTipoServicioUseCase: RegistrarTipoServicioUseCase,
        private readonly actualizarTipoServicioUseCase: ActualizarTipoServicioUseCase,
        private readonly eliminarTipoServicioUseCase: EliminarTipoServicioUseCase
    ) {
        super();
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { limit, offset, q } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerTiposServicioUseCase.execute(negocio_id, page, limit, q);
            res.status(200).json(Respuesta.paginacion('Tipos de servicio obtenidos con éxito', data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const tipoServicio = await this.obtenerTipoServicioUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Tipo de servicio obtenido con éxito', tipoServicio));
        } catch (error) {
            next(error);
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const tipoServicio = await this.registrarTipoServicioUseCase.execute(req.body, negocio_id);
            res.status(201).json(Respuesta.exito('Tipo de servicio creado con éxito', tipoServicio));
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const tipoServicio = await this.actualizarTipoServicioUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Tipo de servicio actualizado con éxito', tipoServicio));
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarTipoServicioUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Tipo de servicio eliminado con éxito', null));
        } catch (error) {
            next(error);
        }
    }
}
