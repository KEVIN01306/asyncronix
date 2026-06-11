import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";
import type { ObtenerProductoUseCase } from "../application/obtener-producto.usecase.js";
import type { ObtenerProductosUseCase } from "../application/obtener-productos.usecase.js";
import type { RegistrarProductoUseCase } from "../application/registrar-producto.usecase.js";
import type { ActualizarProductoUseCase } from "../application/actualizar-producto.usecase.js";
import type { EliminarProductoUseCase } from "../application/eliminar-producto.usecase.js";
import type { SubirImagenProductoUseCase } from "../application/subir-imagen-producto.usecase.js";
import type { CrearVarianteUseCase } from "../application/crear-variante.usecase.js";
import type { ActualizarVarianteUseCase } from "../application/actualizar-variante.usecase.js";
import type { EliminarVarianteUseCase } from "../application/eliminar-variante.usecase.js";
import type { ListarVariantesProductoUseCase } from "../application/listar-variantes-producto.usecase.js";
import type { ListarVariantesNegocioUseCase } from "../application/listar-variantes-negocio.usecase.js";
import type { ObtenerVarianteUseCase } from "../application/obtener-variante.usecase.js";
import type { SubirImagenVarianteUseCase } from "../application/subir-imagen-variante.usecase.js";
import type { ActualizarCodigoBarrasVarianteUseCase } from "../application/actualizar-codigo-barras-variante.usecase.js";
import type { GenerarQrVarianteUseCase } from "../application/generar-qr-variante.usecase.js";
import type { ListarAtributosProductoUseCase } from "../application/listar-atributos-producto.usecase.js";
import type { ActualizarAtributosProductoUseCase } from "../application/actualizar-atributos-producto.usecase.js";
import AppError from "@shared/errors/AppError.js";

export class ProductoController extends BaseController {
    constructor(
        private readonly obtenerProductoUseCase: ObtenerProductoUseCase,
        private readonly obtenerProductosUseCase: ObtenerProductosUseCase,
        private readonly registrarProductoUseCase: RegistrarProductoUseCase,
        private readonly actualizarProductoUseCase: ActualizarProductoUseCase,
        private readonly eliminarProductoUseCase: EliminarProductoUseCase,
        private readonly subirImagenProductoUseCase: SubirImagenProductoUseCase,
        private readonly crearVarianteUseCase: CrearVarianteUseCase,
        private readonly actualizarVarianteUseCase: ActualizarVarianteUseCase,
        private readonly eliminarVarianteUseCase: EliminarVarianteUseCase,
        private readonly listarVariantesProductoUseCase: ListarVariantesProductoUseCase,
        private readonly listarVariantesNegocioUseCase: ListarVariantesNegocioUseCase,
        private readonly obtenerVarianteUseCase: ObtenerVarianteUseCase,
        private readonly subirImagenVarianteUseCase: SubirImagenVarianteUseCase,
        private readonly actualizarCodigoBarrasVarianteUseCase: ActualizarCodigoBarrasVarianteUseCase,
        private readonly generarQrVarianteUseCase: GenerarQrVarianteUseCase,
        private readonly listarAtributosProductoUseCase: ListarAtributosProductoUseCase,
        private readonly actualizarAtributosProductoUseCase: ActualizarAtributosProductoUseCase
    ) {
        super();
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const producto = await this.obtenerProductoUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Producto obtenido con exito', producto));
        } catch (error) {
            next(error);
        }
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { limit, offset, categoria_id } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerProductosUseCase.execute({
                negocio_id,
                pagination: { page, perPage: limit },
                categoria_id
            });
            res.status(200).json(Respuesta.paginacion('Productos obtenidos con exito', data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const producto = await this.registrarProductoUseCase.execute(req.body, negocio_id);
            res.status(201).json(Respuesta.exito('Producto creado con exito', producto));
        } catch (error) {
            next(error);
        }
    }

    listarVariantes = async (req: Request<{ producto_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { producto_id } = req.params;
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const variantes = await this.listarVariantesProductoUseCase.execute(producto_id, negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito('Variantes obtenidas con exito', variantes));
        } catch (error) {
            next(error);
        }
    }

    listarAtributos = async (req: Request<{ producto_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { producto_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const atributos = await this.listarAtributosProductoUseCase.execute(producto_id, negocio_id);
            res.status(200).json(Respuesta.exito('Atributos del producto obtenidos con exito', atributos));
        } catch (error) {
            next(error);
        }
    }

    actualizarAtributos = async (req: Request<{ producto_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { producto_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { atributos } = req.body;
            const updatedAtributos = await this.actualizarAtributosProductoUseCase.execute(producto_id, negocio_id, atributos);
            res.status(200).json(Respuesta.exito('Atributos del producto actualizados con exito', updatedAtributos));
        } catch (error) {
            next(error);
        }
    }

    listarVariantesNegocio = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id, sucursal_id } = this.obtenerEntorno(res);
            const variantes = await this.listarVariantesNegocioUseCase.execute(negocio_id, sucursal_id);
            res.status(200).json(Respuesta.exito('Variantes obtenidas con exito', variantes));
        } catch (error) {
            next(error);
        }
    }

    crearVariante = async (req: Request<{ producto_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { producto_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const variant = await this.crearVarianteUseCase.execute({ ...req.body, producto_id }, negocio_id);
            res.status(201).json(Respuesta.exito('Variante creada con exito', variant));
        } catch (error) {
            next(error);
        }
    }

    obtenerVariante = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const variant = await this.obtenerVarianteUseCase.execute(id, negocio_id);

            if (!variant) {
                throw new AppError('Variante no encontrada', 'VARIANTE_NOT_FOUND', 404);
            }

            res.status(200).json(Respuesta.exito('Variante obtenida con exito', variant));
        } catch (error) {
            next(error);
        }
    }

    subirImagenVariante = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);

            if (!req.file) throw new AppError('No se ha subido ninguna imagen', 'IMAGE_REQUIRED', 400);

            const url_imagen = req.file.path.replace(/\\/g, '/');
            const variant = await this.subirImagenVarianteUseCase.execute(id, url_imagen, negocio_id);

            res.status(201).json(Respuesta.exito('Imagen de variante subida con exito', variant));
        } catch (error) {
            next(error);
        }
    }

    actualizarCodigoBarrasVariante = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { codigo_barras } = req.body;
            const variant = await this.actualizarCodigoBarrasVarianteUseCase.execute(id, negocio_id, codigo_barras);
            res.status(200).json(Respuesta.exito('Codigo de barras actualizado con exito', variant));
        } catch (error) {
            next(error);
        }
    }

    generarQrVariante = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const variant = await this.generarQrVarianteUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('QR generado con exito', variant));
        } catch (error) {
            next(error);
        }
    }

    actualizarVariante = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const variant = await this.actualizarVarianteUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Variante actualizada con exito', variant));
        } catch (error) {
            next(error);
        }
    }

    eliminarVariante = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarVarianteUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Variante eliminada con exito', null));
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const producto = await this.actualizarProductoUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Producto actualizado con exito', producto));
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarProductoUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Producto eliminado con exito', null));
        } catch (error) {
            next(error);
        }
    }

    subirImagen = async (req: Request<{ producto_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { producto_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);

            if (!req.file) throw new AppError('No se ha subido ninguna imagen', 'IMAGE_REQUIRED', 400);

            const url_imagen = req.file.path.replace(/\\/g, '/');
            const producto = await this.subirImagenProductoUseCase.execute({
                producto_id,
                url_imagen,
                negocio_id
            });

            res.status(201).json(Respuesta.exito('Imagen subida con exito', producto));
        } catch (error) {
            next(error);
        }
    }
}
