import type { NextFunction, Request, Response } from "express";
import AppError from "../../../shared/errors/AppError.js";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { RegistrarVentaUseCase } from "../application/registrar-venta.usecase.js";
import type { ActualizarVentaUseCase } from "../application/actualizar-venta.usecase.js";
import type { AnularVentaUseCase } from "../application/anular-venta.usecase.js";
import type { ObtenerVentaUseCase } from "../application/obtener-venta.usecase.js";
import type { ObtenerVentasUseCase } from "../application/obtener-ventas.usecase.js";
import type { CrearDetalleVentaUseCase } from "../application/crear-detalle-venta.usecase.js";
import type { CrearDetalleVentaPorSkuUseCase } from "../application/crear-detalle-venta-por-sku.usecase.js";
import type { BuscarProductoPorSkuUseCase } from "../application/buscar-producto-por-sku.usecase.js";
import type { EliminarDetalleVentaUseCase } from "../application/eliminar-detalle-venta.usecase.js";
import type { FinalizarVentaUseCase } from "../application/finalizar-venta.usecase.js";

export class VentaController extends BaseController {
    constructor(
        private readonly registrarVentaUseCase: RegistrarVentaUseCase,
        private readonly actualizarVentaUseCase: ActualizarVentaUseCase,
        private readonly anularVentaUseCase: AnularVentaUseCase,
        private readonly obtenerVentaUseCase: ObtenerVentaUseCase,
        private readonly obtenerVentasUseCase: ObtenerVentasUseCase,
        private readonly crearDetalleVentaUseCase: CrearDetalleVentaUseCase,
        private readonly crearDetalleVentaPorSkuUseCase: CrearDetalleVentaPorSkuUseCase,
        private readonly buscarProductoPorSkuUseCase: BuscarProductoPorSkuUseCase,
        private readonly eliminarDetalleVentaUseCase: EliminarDetalleVentaUseCase,
        private readonly finalizarVentaUseCase: FinalizarVentaUseCase
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
            const { sucursal_id, comentario } = req.body;
            if (!sucursal_id) throw new AppError("Sucursal requerida", "SUCURSAL_REQUERIDA", 400);
            if (!comentario || comentario.trim().length === 0) throw new AppError("El comentario es obligatorio", "COMENTARIO_REQUERIDO", 400);

            const venta = await this.anularVentaUseCase.execute(id, negocio_id, sucursal_id, comentario);
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
            if (!sucursal_id) throw new Error("SUCURSAL_REQUERIDA");

            const { limit, offset, cliente_id } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;

            const { total, data } = await this.obtenerVentasUseCase.execute(negocio_id, sucursal_id, { page, perPage: limit }, cliente_id);
            res.status(200).json(Respuesta.paginacion("Ventas obtenidas con éxito", data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

    crearDetalle = async (req: Request<{ ventaId: string }>, res: Response, next: NextFunction) => {
        try {
            const { ventaId } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { sucursal_id, producto_id, cantidad } = req.body;
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');

            const detalle = await this.crearDetalleVentaUseCase.execute(ventaId, producto_id, cantidad, negocio_id, sucursal_id);
            res.status(201).json(Respuesta.exito('Detalle creado', detalle));
        } catch (error) {
            next(error);
        }
    }

    buscarPorSku = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { sku } = req.query;
            if (!sku || typeof sku !== 'string') throw new Error('SKU_REQUERIDO');

            const producto = await this.buscarProductoPorSkuUseCase.execute(sku, negocio_id);
            res.status(200).json(Respuesta.exito('Producto encontrado', producto));
        } catch (error) {
            next(error);
        }
    }

    crearDetallePorSku = async (req: Request<{ ventaId: string }>, res: Response, next: NextFunction) => {
        try {
            const { ventaId } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { sucursal_id, sku, cantidad } = req.body;
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');
            if (!sku || typeof sku !== 'string') throw new Error('SKU_REQUERIDO');

            const detalle = await this.crearDetalleVentaPorSkuUseCase.execute(ventaId, sku, cantidad, negocio_id, sucursal_id);
            res.status(201).json(Respuesta.exito('Detalle por SKU creado', detalle));
        } catch (error) {
            next(error);
        }
    }

    eliminarDetalle = async (req: Request<{ ventaId: string, detalleId: string }>, res: Response, next: NextFunction) => {
        try {
            const { ventaId, detalleId } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { sucursal_id } = req.body;
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');

            await this.eliminarDetalleVentaUseCase.execute(ventaId, detalleId, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito('Detalle eliminado',null));
        } catch (error) {
            next(error);
        }
    }

    finalizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { sucursal_id, metodo_pago } = req.body;
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');

            const venta = await this.finalizarVentaUseCase.execute(id, negocio_id, sucursal_id, metodo_pago);
            res.status(200).json(Respuesta.exito('Venta finalizada', venta));
        } catch (error) {
            next(error);
        }
    }
}
