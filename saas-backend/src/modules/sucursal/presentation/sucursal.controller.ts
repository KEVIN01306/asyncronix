import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";
import type { ObtenerSucursalUseCase } from "../application/obtener-sucurrsal.usecase.js";
import type { RegistrarSucursalUseCase } from "../application/registrar-sucurrsal.usecase.js";
import type { ActualizarSucursalUseCase } from "../application/actualizar-sucurrsal.usecase.js";
import type { EliminarSucursalUseCase } from "../application/eliminar-sucursal.usecase.js";
import type { ObtenerSucursalesUseCase } from "../application/obtener-sucurrsales.usecase.js";


export class SucursalController extends BaseController {

    constructor(
        private readonly obtenerSucursalUseCase: ObtenerSucursalUseCase,
        private readonly obtenerSucursalesUseCase: ObtenerSucursalesUseCase,
        private readonly registrarSucursalUseCase: RegistrarSucursalUseCase,
        private readonly actualizarSucursalUseCase: ActualizarSucursalUseCase,
        private readonly eliminarSucursalUseCase: EliminarSucursalUseCase
    ) {
        super()
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            const sucursal = await this.obtenerSucursalUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Sucursal obtenida con éxito', sucursal))
        } catch (error) {
            next(error)
        }
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const { limit, offset } = res.locals.query
            const page = Math.floor(offset / limit) + 1
            const { total, data } = await this.obtenerSucursalesUseCase.execute(negocio_id, page, limit);
            res.status(200).json(Respuesta.paginacion('Sucursales obtenidas con éxito', data, total, limit, offset))
        } catch (error) {
            next(error)
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const sucursal = await this.registrarSucursalUseCase.execute(req.body, negocio_id)
            res.status(201).json(Respuesta.exito('Sucursal creada con éxito', sucursal))
        } catch (error) {
            next(error)
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            const sucursal = await this.actualizarSucursalUseCase.execute(id, negocio_id, req.body)
            res.status(200).json(Respuesta.exito('Sucursal actualizada con éxito', sucursal))
        } catch (error) {
            next(error)
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            await this.eliminarSucursalUseCase.execute(id, negocio_id)
            res.status(200).json(Respuesta.exito('Sucursal eliminada con éxito', null))
        } catch (error) {
            next(error)
        }
    }
}
