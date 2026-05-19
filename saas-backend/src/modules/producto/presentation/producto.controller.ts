import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";
import type { ObtenerProductoUseCase } from "../application/obtener-producto.usecase.js";
import type { ObtenerProductosUseCase } from "../application/obtener-productos.usecase.js";
import type { RegistrarProductoUseCase } from "../application/registrar-producto.usecase.js";
import type { ActualizarProductoUseCase } from "../application/actualizar-producto.usecase.js";
import type { EliminarProductoUseCase } from "../application/eliminar-producto.usecase.js";
import type { SubirImagenProductoUseCase } from "../application/subir-imagen-producto.usecase.js";
import AppError from "@shared/errors/AppError.js";

export class ProductoController extends BaseController {
    constructor(
        private readonly obtenerProductoUseCase: ObtenerProductoUseCase,
        private readonly obtenerProductosUseCase: ObtenerProductosUseCase,
        private readonly registrarProductoUseCase: RegistrarProductoUseCase,
        private readonly actualizarProductoUseCase: ActualizarProductoUseCase,
        private readonly eliminarProductoUseCase: EliminarProductoUseCase,
        private readonly subirImagenProductoUseCase: SubirImagenProductoUseCase
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
