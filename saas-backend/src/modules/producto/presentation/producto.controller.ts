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
import type { ActualizarCodigoBarrasVarianteUseCase } from "../application/actualizar-codigo-barras-variante.usecase.js";
import type { GenerarQrVarianteUseCase } from "../application/generar-qr-variante.usecase.js";
import type { BuscarVariantePorCodigoUseCase } from "../application/buscar-variante-por-codigo.usecase.js";
import type { ListarAtributosProductoUseCase } from "../application/listar-atributos-producto.usecase.js";
import type { ActualizarAtributosProductoUseCase } from "../application/actualizar-atributos-producto.usecase.js";
import type { ListarImagenesProductoUseCase } from "../application/listar-imagenes-producto.usecase.js";
import type { ActualizarArchivoImagenProductoUseCase } from "../application/actualizar-archivo-imagen-producto.usecase.js";
import type { ActualizarDescripcionImagenProductoUseCase } from "../application/actualizar-descripcion-imagen-producto.usecase.js";
import type { EstablecerImagenPrincipalProductoUseCase } from "../application/establecer-imagen-principal-producto.usecase.js";
import type { EliminarImagenProductoUseCase } from "../application/eliminar-imagen-producto.usecase.js";
import AppError from "@shared/errors/AppError.js";
import type { IStorageProvider } from "@shared/domain/providers/storage.provider.js";

export class ProductoController extends BaseController {
    constructor(
        private readonly obtenerProductoUseCase: ObtenerProductoUseCase,
        private readonly obtenerProductosUseCase: ObtenerProductosUseCase,
        private readonly registrarProductoUseCase: RegistrarProductoUseCase,
        private readonly actualizarProductoUseCase: ActualizarProductoUseCase,
        private readonly eliminarProductoUseCase: EliminarProductoUseCase,
        private readonly subirImagenProductoUseCase: SubirImagenProductoUseCase,
        private readonly listarImagenesProductoUseCase: ListarImagenesProductoUseCase,
        private readonly actualizarArchivoImagenProductoUseCase: ActualizarArchivoImagenProductoUseCase,
        private readonly actualizarDescripcionImagenProductoUseCase: ActualizarDescripcionImagenProductoUseCase,
        private readonly establecerImagenPrincipalProductoUseCase: EstablecerImagenPrincipalProductoUseCase,
        private readonly eliminarImagenProductoUseCase: EliminarImagenProductoUseCase,
        private readonly crearVarianteUseCase: CrearVarianteUseCase,
        private readonly actualizarVarianteUseCase: ActualizarVarianteUseCase,
        private readonly eliminarVarianteUseCase: EliminarVarianteUseCase,
        private readonly listarVariantesProductoUseCase: ListarVariantesProductoUseCase,
        private readonly listarVariantesNegocioUseCase: ListarVariantesNegocioUseCase,
        private readonly obtenerVarianteUseCase: ObtenerVarianteUseCase,
        private readonly actualizarCodigoBarrasVarianteUseCase: ActualizarCodigoBarrasVarianteUseCase,
        private readonly generarQrVarianteUseCase: GenerarQrVarianteUseCase,
        private readonly buscarVariantePorCodigoUseCase: BuscarVariantePorCodigoUseCase,
        private readonly listarAtributosProductoUseCase: ListarAtributosProductoUseCase,
        private readonly actualizarAtributosProductoUseCase: ActualizarAtributosProductoUseCase,
        private readonly storageProvider: IStorageProvider
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
            const { limit, offset, categoria_id, q, sku } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerProductosUseCase.execute({
                negocio_id,
                pagination: { page, perPage: limit },
                categoria_id,
                q,
                sku
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

    buscarPorCodigo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { q } = res.locals.query;
            const variant = await this.buscarVariantePorCodigoUseCase.execute(q, negocio_id);
            res.status(200).json(Respuesta.exito('Variante encontrada', variant));
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
            const { descripcion } = req.body;

            if (!req.file) throw new AppError('No se ha subido ninguna imagen', 'IMAGE_REQUIRED', 400);

            const path = `tenant_${negocio_id}/products/prod_${producto_id}`;
            const url = await this.storageProvider.uploadFile(req.file, path);
            const producto = await this.subirImagenProductoUseCase.execute({
                producto_id,
                url,
                descripcion: descripcion ?? null,
                negocio_id
            });

            res.status(201).json(Respuesta.exito('Imagen subida con exito', producto));
        } catch (error) {
            next(error);
        }
    }

    listarImagenes = async (req: Request<{ producto_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { producto_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const imagenes = await this.listarImagenesProductoUseCase.execute(producto_id, negocio_id);
            res.status(200).json(Respuesta.exito('Imagenes obtenidas con exito', imagenes));
        } catch (error) {
            next(error);
        }
    }

    actualizarArchivoImagen = async (req: Request<{ imagen_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { imagen_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            if (!req.file) throw new AppError('No se ha subido ninguna imagen', 'IMAGE_REQUIRED', 400);

            const imagen = await this.actualizarArchivoImagenProductoUseCase.execute(imagen_id, req.file, negocio_id);
            res.status(200).json(Respuesta.exito('Imagen actualizada con exito', imagen));
        } catch (error) {
            next(error);
        }
    }

    actualizarDescripcionImagen = async (req: Request<{ imagen_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { imagen_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { descripcion } = req.body;
            const imagen = await this.actualizarDescripcionImagenProductoUseCase.execute(imagen_id, descripcion ?? null, negocio_id);
            res.status(200).json(Respuesta.exito('Descripcion actualizada con exito', imagen));
        } catch (error) {
            next(error);
        }
    }

    establecerImagenPrincipal = async (req: Request<{ imagen_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { imagen_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const imagen = await this.establecerImagenPrincipalProductoUseCase.execute(imagen_id, negocio_id);
            res.status(200).json(Respuesta.exito('Imagen principal actualizada con exito', imagen));
        } catch (error) {
            next(error);
        }
    }

    eliminarImagen = async (req: Request<{ imagen_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { imagen_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarImagenProductoUseCase.execute(imagen_id, negocio_id);
            res.status(200).json(Respuesta.exito('Imagen eliminada con exito', null));
        } catch (error) {
            next(error);
        }
    }
}
