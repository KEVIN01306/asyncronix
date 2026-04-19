import type { NextFunction, Request, Response } from "express";
import type { ObtenerClienteUseCase } from "../application/obtener-cliente.usecase.js";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerClientesUseCase } from "../application/obtener-clientes.js";
import type { RegistrarClienteUseCase } from "../application/registrar-cliente.usecase.js";
import type { ActualizarClienteUseCase } from "../application/actualizar-cliente.usecase.js";
import type { EliminarClienteUseCase } from "../application/eliminar-cliente.usecase.js";


export class ClienteController extends BaseController {

    constructor(
        private readonly obtenerClienteUseCase: ObtenerClienteUseCase,
        private readonly obtenerClientesUseCase: ObtenerClientesUseCase,
        private readonly registrarClienteUseCase: RegistrarClienteUseCase,
        private readonly actualizarClienteUseCase: ActualizarClienteUseCase,
        private readonly eliminarClienteUseCase: EliminarClienteUseCase
    ) {
        super()
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            const cliente = await this.obtenerClienteUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Cliente obtenido con exito', cliente))
        } catch (error) {
            next(error)
        }
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const { limit, offset } = res.locals.query
            const page = Math.floor(offset / limit) + 1
            const { total, data } = await this.obtenerClientesUseCase.execute({ negocio_id, page, perPage: limit });
            res.status(200).json(Respuesta.paginacion('Clientes obtenidos con exito', data, total, limit, offset))
        } catch (error) {
            next(error)
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res)
            const cliente = await this.registrarClienteUseCase.execute(req.body, negocio_id)
            res.status(201).json(Respuesta.exito('Cliente creado con exito', cliente))
        } catch (error) {
            next(error)
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            const cliente = await this.actualizarClienteUseCase.execute(id, negocio_id, req.body)
            res.status(200).json(Respuesta.exito('Cliente actualizado con exito', cliente))
        } catch (error) {
            next(error)
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { negocio_id } = this.obtenerEntorno(res)
            await this.eliminarClienteUseCase.execute(id, negocio_id)
            res.status(200).json(Respuesta.exito('Cliente eliminado con exito', null))
        } catch (error) {
            next(error)
        }
    }
}
