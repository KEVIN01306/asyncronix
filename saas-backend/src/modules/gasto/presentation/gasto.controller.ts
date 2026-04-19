import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerGastoUseCase } from "../application/obtener-gasto.usecase.js";
import type { ObtenerGastosUseCase } from "../application/obtener-gastos.usecase.js";
import type { RegistrarGastoUseCase } from "../application/registrar-gasto.usecase.js";
import type { ActualizarGastoUseCase } from "../application/actualizar-gasto.usecase.js";
import type { EliminarGastoUseCase } from "../application/eliminar-gasto.usecase.js";

export class GastoController extends BaseController {

    constructor(
        private readonly obtenerGastoUseCase: ObtenerGastoUseCase,
        private readonly obtenerGastosUseCase: ObtenerGastosUseCase,
        private readonly registrarGastoUseCase: RegistrarGastoUseCase,
        private readonly actualizarGastoUseCase: ActualizarGastoUseCase,
        private readonly eliminarGastoUseCase: EliminarGastoUseCase
    ) {
        super()
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            const gasto = await this.obtenerGastoUseCase.execute({ id, negocio_id });
            res.status(200).json(Respuesta.exito('Gasto obtenido con exito', gasto))
        } catch (error) {
            next(error)
        }
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const { limit, offset, sucursal_ids } = res.locals.query
            const page = offset / limit + 1

            const { total, gastos } = await this.obtenerGastosUseCase.execute({
                negocio_id,
                pagination: { page, perPage: limit },
                sucursal_ids
            });



            res.status(200).json(Respuesta.paginacion('Gastos obtenidos con exito', gastos, total, limit, offset))
        } catch (error) {
            next(error)
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const gasto = await this.registrarGastoUseCase.execute(req.body, negocio_id)
            res.status(201).json(Respuesta.exito('Gasto registrado con exito', gasto))
        } catch (error) {
            next(error)
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            const gasto = await this.actualizarGastoUseCase.execute(id, negocio_id, req.body)
            res.status(200).json(Respuesta.exito('Gasto actualizado con exito', gasto))
        } catch (error) {
            next(error)
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            await this.eliminarGastoUseCase.execute(id, negocio_id)
            res.status(200).json(Respuesta.exito('Gasto eliminado con exito', null))
        } catch (error) {
            next(error)
        }
    }
}
