import type { NextFunction, Request, Response } from "express";
import AppError from "../../../shared/errors/AppError.js";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { RegistrarVentaUseCase } from "../application/registrar-venta.usecase.js";
import type { ActualizarVentaUseCase } from "../application/actualizar-venta.usecase.js";
import type { AnularVentaUseCase } from "../application/anular-venta.usecase.js";
import type { ObtenerVentaUseCase } from "../application/obtener-venta.usecase.js";
import type { ObtenerVentasUseCase } from "../application/obtener-ventas.usecase.js";
import type { AgregarProductoUseCase } from "../application/agregar-producto.usecase.js";
import type { BuscarProductoPorCodigoUseCase } from "../application/buscar-producto-por-sku.usecase.js";
import type { EliminarDetalleVentaUseCase } from "../application/eliminar-detalle-venta.usecase.js";
import type { FinalizarVentaUseCase } from "../application/finalizar-venta.usecase.js";
import type { BuscarClientePorNitVentaUseCase } from "../application/buscar-cliente-por-nit.usecase.js";
import type { RegistrarClienteParaVentaUseCase } from "../application/registrar-cliente-para-venta.usecase.js";import type { CrearPreVentaUseCase } from "../application/crear-preventa.usecase.js";
import type { ObtenerPreVentasUseCase } from "../application/obtener-preventas.usecase.js";
import type { ObtenerPreVentaUseCase } from "../application/obtener-preventa.usecase.js";
import type { ActualizarCantidadPreVentaUseCase } from "../application/actualizar-cantidad-preventa.usecase.js";
import type { FinalizarPreVentaUseCase } from "../application/finalizar-preventa.usecase.js";
import type { ActualizarClientePreVentaUseCase } from "../application/actualizar-cliente-preventa.usecase.js";
import type { EliminarDetallePreVentaUseCase } from "../application/eliminar-detalle-preventa.usecase.js";
export class VentaController extends BaseController {
    constructor(
        private readonly registrarVentaUseCase: RegistrarVentaUseCase,
        private readonly actualizarVentaUseCase: ActualizarVentaUseCase,
        private readonly anularVentaUseCase: AnularVentaUseCase,
        private readonly obtenerVentaUseCase: ObtenerVentaUseCase,
        private readonly obtenerVentasUseCase: ObtenerVentasUseCase,
        private readonly agregarProductoUseCase: AgregarProductoUseCase,
        private readonly buscarProductoPorCodigoUseCase: BuscarProductoPorCodigoUseCase,
        private readonly eliminarDetalleVentaUseCase: EliminarDetalleVentaUseCase,
        private readonly finalizarVentaUseCase: FinalizarVentaUseCase,
        private readonly buscarClientePorNitVentaUseCase: BuscarClientePorNitVentaUseCase,
        private readonly registrarClienteParaVentaUseCase: RegistrarClienteParaVentaUseCase,
        private readonly crearPreVentaUseCase: CrearPreVentaUseCase,
        private readonly obtenerPreVentasUseCase: ObtenerPreVentasUseCase,
        private readonly obtenerPreVentaUseCase: ObtenerPreVentaUseCase,
        private readonly actualizarCantidadPreVentaUseCase: ActualizarCantidadPreVentaUseCase,
        private readonly finalizarPreVentaUseCase: FinalizarPreVentaUseCase,
        private readonly validarPinCajaUseCase: any,
        private readonly agregarDetallePreVentaUseCase: any,
        private readonly actualizarClientePreVentaUseCase: ActualizarClientePreVentaUseCase,
        private readonly eliminarDetallePreVentaUseCase: EliminarDetallePreVentaUseCase
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

            const { limit, offset, cliente_id, metodo_pago, q, fecha_inicio, fecha_fin } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;

            const { total, data } = await this.obtenerVentasUseCase.execute(negocio_id, sucursal_id, { page, perPage: limit }, cliente_id, metodo_pago, q, fecha_inicio, fecha_fin);
            res.status(200).json(Respuesta.paginacion("Ventas obtenidas con éxito", data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

    agregarProducto = async (req: Request<{ ventaId: string }>, res: Response, next: NextFunction) => {
        try {
            const { ventaId } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { sucursal_id, codigo, cantidad } = req.body;
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');
            if (!codigo || typeof codigo !== 'string') throw new Error('CODIGO_REQUERIDO');

            const detalle = await this.agregarProductoUseCase.execute(ventaId, codigo, cantidad, negocio_id, sucursal_id);
            res.status(201).json(Respuesta.exito('Producto agregado a la venta', detalle));
        } catch (error) {
            next(error);
        }
    }

    buscarPorCodigo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const value = typeof req.query.q === 'string'
                ? req.query.q
                : typeof req.query.codigo === 'string'
                    ? req.query.codigo
                    : typeof req.query.sku === 'string'
                        ? req.query.sku
                        : '';

            if (!value) throw new Error('VALOR_REQUERIDO');

            const variante = await this.buscarProductoPorCodigoUseCase.execute(value, negocio_id);
            res.status(200).json(Respuesta.exito('Variante encontrada', variante));
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

    buscarClientePorNit = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { nit } = res.locals.query;
            const cliente = await this.buscarClientePorNitVentaUseCase.execute(nit, negocio_id);
            res.status(200).json(Respuesta.exito('Búsqueda de cliente completada', cliente));
        } catch (error) {
            next(error);
        }
    }

    registrarCliente = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const cliente = await this.registrarClienteParaVentaUseCase.execute(req.body, negocio_id);
            res.status(201).json(Respuesta.exito('Cliente creado con éxito', cliente));
        } catch (error) {
            next(error);
        }
    }

    crearPreVenta = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id: usuario_id, negocio_id } = this.obtenerEntorno(res);
            const { sucursal_id, cliente_id, items } = req.body;
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');

            const preventa = await this.crearPreVentaUseCase.execute({ sucursal_id, cliente_id, items }, negocio_id, sucursal_id, usuario_id);
            res.status(201).json(Respuesta.exito('Preventa creada con éxito', preventa));
        } catch (error) {
            next(error);
        }
    }

    crearDetallePreVenta = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { id: usuario_id, negocio_id, sucursal_id } = this.obtenerEntorno(res);
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');

            const item = req.body;
            const preventa = await this.agregarDetallePreVentaUseCase.execute(id, item, negocio_id, sucursal_id, usuario_id);
            res.status(201).json(Respuesta.exito('Detalle agregado a la preventa', preventa));
        } catch (error) {
            next(error);
        }
    }

    actualizarClientePreVenta = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { id: usuario_id, negocio_id, sucursal_id } = this.obtenerEntorno(res);
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');

            const { cliente_id } = req.body;
            const preventa = await this.actualizarClientePreVentaUseCase.execute(id, cliente_id ?? null, negocio_id, sucursal_id, usuario_id);
            res.status(200).json(Respuesta.exito('Cliente asociado a la preventa', preventa));
        } catch (error) {
            next(error);
        }
    }

    listarPreVentas = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { id: usuario_id, negocio_id, sucursal_id } = this.obtenerEntorno(res);
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');

            const preventas = await this.obtenerPreVentasUseCase.execute(negocio_id, sucursal_id, usuario_id);
            res.status(200).json(Respuesta.exito('Preventas obtenidas con éxito', preventas));
        } catch (error) {
            next(error);
        }
    }

    obtenerPreVenta = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { id: usuario_id, negocio_id, sucursal_id } = this.obtenerEntorno(res);
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');

            const preventa = await this.obtenerPreVentaUseCase.execute(id, negocio_id, sucursal_id, usuario_id);
            res.status(200).json(Respuesta.exito('Preventa obtenida con éxito', preventa));
        } catch (error) {
            next(error);
        }
    }

    actualizarCantidadPreVenta = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');

            const { cantidad } = req.body;
            const result = await this.actualizarCantidadPreVentaUseCase.execute(id, cantidad, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito('Cantidad actualizada', result));
        } catch (error) {
            next(error);
        }
    }

    eliminarDetallePreVenta = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { id: usuario_id, negocio_id, sucursal_id } = this.obtenerEntorno(res);
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');

            const preventa = await this.eliminarDetallePreVentaUseCase.execute(id, negocio_id, sucursal_id, usuario_id);
            res.status(200).json(Respuesta.exito('Detalle de preventa eliminado', preventa));
        } catch (error) {
            next(error);
        }
    }

    finalizarPreVenta = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { id: usuario_id, negocio_id, sucursal_id } = this.obtenerEntorno(res);
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');

            const result = await this.finalizarPreVentaUseCase.execute(id, negocio_id, sucursal_id, usuario_id, req.body, res.locals.usuario?.permisos ?? []);
            res.status(200).json(Respuesta.exito('Preventa finalizada con éxito', result));
        } catch (error) {
            next(error);
        }
    }

    validarPinCaja = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id: usuario_id, negocio_id, sucursal_id } = this.obtenerEntorno(res);
            if (!sucursal_id) throw new Error('SUCURSAL_REQUERIDA');

            const { pin_caja } = req.body;
            const result = await this.validarPinCajaUseCase.execute(pin_caja, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito('PIN válido', result));
        } catch (error) {
            next(error);
        }
    }
}
