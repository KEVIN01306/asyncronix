import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { RegistrarVentaUseCase } from "../application/registrar-venta.usecase.js";
import type { ActualizarVentaUseCase } from "../application/actualizar-venta.usecase.js";
import type { AnularVentaUseCase } from "../application/anular-venta.usecase.js";
import type { ObtenerVentaUseCase } from "../application/obtener-venta.usecase.js";
import type { ObtenerVentasUseCase } from "../application/obtener-ventas.usecase.js";

export class VentaController extends BaseController {
    constructor(
        private readonly registrarVentaUseCase: RegistrarVentaUseCase,
        private readonly actualizarVentaUseCase: ActualizarVentaUseCase,
        private readonly anularVentaUseCase: AnularVentaUseCase,
        private readonly obtenerVentaUseCase: ObtenerVentaUseCase,
        private readonly obtenerVentasUseCase: ObtenerVentasUseCase
    ) {
        super();
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id: usuario_id, negocio_id } = this.obtenerEntorno(res);
            const { sucursal_id } = req.body;
            if (!sucursal_id) throw new Error("SUCURSAL_REQUERIDA");
            
            const venta = await this.registrarVentaUseCase.execute(req.body, negocio_id, sucursal_id, usuario_id);
            res.status(201).json(Respuesta.exito("Venta registrada con éxito", venta));
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { sucursal_id } = req.body;
            if (!sucursal_id) throw new Error("SUCURSAL_REQUERIDA");

            const venta = await this.actualizarVentaUseCase.execute(id, req.body, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito("Venta actualizada con éxito", venta));
        } catch (error) {
            next(error);
        }
    }

    anular = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { sucursal_id } = req.body;
            if (!sucursal_id) throw new Error("SUCURSAL_REQUERIDA");

            const venta = await this.anularVentaUseCase.execute(id, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito("Venta anulada con éxito", venta));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            if (!sucursal_id) throw new Error("SUCURSAL_REQUERIDA");

            const venta = await this.obtenerVentaUseCase.execute(id, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito("Venta obtenida con éxito", venta));
        } catch (error) {
            next(error);
        }
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            console.log("esta es la sucursal: ", sucursal_id)
            if (!sucursal_id) throw new Error("SUCURSAL_REQUERIDA");

            const { limit, offset } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;

            const { total, data } = await this.obtenerVentasUseCase.execute(negocio_id, sucursal_id, { page, perPage: limit });
            res.status(200).json(Respuesta.paginacion("Ventas obtenidas con éxito", data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }
}
