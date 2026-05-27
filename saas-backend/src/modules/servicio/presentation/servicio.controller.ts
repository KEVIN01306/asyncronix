import type { NextFunction, Request, Response } from "express";
import BaseController from "@shared/presentation/base.controller.js";
import Respuesta from "@app/http/respuesta.js";
import type { ObtenerServiciosUseCase } from "../application/obtener-servicios.usecase.js";
import type { ObtenerServicioUseCase } from "../application/obtener-servicio.usecase.js";
import type { RegistrarServicioUseCase } from "../application/registrar-servicio.usecase.js";
import type { ActualizarServicioUseCase } from "../application/actualizar-servicio.usecase.js";
import type { CambiarEstadoServicioUseCase } from "../application/cambiar-estado-servicio.usecase.js";
import type { GuardarFirmaEntradaUseCase } from "../application/guardar-firma-entrada.usecase.js";
import type { SubirImagenServicioUseCase } from "../application/subir-imagen-servicio.usecase.js";
import type { SubirImagenProgresoServicioUseCase } from "../application/subir-imagen-progreso-servicio.usecase.js";
import type { EliminarImagenServicioUseCase } from "../application/eliminar-imagen-servicio.usecase.js";
import type { ListarChecklistRespuestasUseCase } from "../application/listar-checklist-respuestas.usecase.js";
import type { RegistrarChecklistRespuestaUseCase } from "../application/registrar-checklist-respuesta.usecase.js";
import type { ActualizarChecklistRespuestaUseCase } from "../application/actualizar-checklist-respuesta.usecase.js";
import type { EliminarChecklistRespuestaUseCase } from "../application/eliminar-checklist-respuesta.usecase.js";
import type { ActualizarServicioTareaUseCase } from "../application/actualizar-servicio-tarea.usecase.js";
import type { AsociarClienteServicioUseCase } from "../application/asociar-cliente-servicio.usecase.js";
import type { AsociarMecanicoServicioUseCase } from "../application/asociar-mecanico-servicio.usecase.js";
import type { CambiarMecanicoServicioUseCase } from "../application/cambiar-mecanico-servicio.usecase.js";
import AppError from "@shared/errors/AppError.js";

export class ServicioController extends BaseController {
    constructor(
        private readonly obtenerServiciosUseCase: ObtenerServiciosUseCase,
        private readonly obtenerServicioUseCase: ObtenerServicioUseCase,
        private readonly registrarServicioUseCase: RegistrarServicioUseCase,
        private readonly actualizarServicioUseCase: ActualizarServicioUseCase,
        private readonly cambiarEstadoServicioUseCase: CambiarEstadoServicioUseCase,
        private readonly guardarFirmaEntradaUseCase: GuardarFirmaEntradaUseCase,
        private readonly subirImagenServicioUseCase: SubirImagenServicioUseCase,
        private readonly subirImagenProgresoServicioUseCase: SubirImagenProgresoServicioUseCase,
        private readonly eliminarImagenServicioUseCase: EliminarImagenServicioUseCase,
        private readonly listarChecklistRespuestasUseCase: ListarChecklistRespuestasUseCase,
        private readonly registrarChecklistRespuestaUseCase: RegistrarChecklistRespuestaUseCase,
        private readonly actualizarChecklistRespuestaUseCase: ActualizarChecklistRespuestaUseCase,
        private readonly eliminarChecklistRespuestaUseCase: EliminarChecklistRespuestaUseCase,
        private readonly actualizarTareaUseCase: ActualizarServicioTareaUseCase,
        private readonly asociarClienteServicioUseCase?: AsociarClienteServicioUseCase,
        private readonly asociarMecanicoServicioUseCase?: AsociarMecanicoServicioUseCase,
        private readonly cambiarMecanicoServicioUseCase?: CambiarMecanicoServicioUseCase
    ) {
        super();
    }

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { limit, offset, estado } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const result = await this.obtenerServiciosUseCase.execute(negocio_id, page, limit as number);
            res.status(200).json(Respuesta.paginacion('Servicios obtenidos con éxito', result.data, result.total, limit as number, offset as number));
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const servicio = await this.obtenerServicioUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Servicio obtenido con éxito', servicio));
        } catch (error) {
            next(error);
        }
    }

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const servicio = await this.registrarServicioUseCase.execute(req.body, negocio_id);
            res.status(201).json(Respuesta.exito('Servicio creado con éxito', servicio));
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const servicio = await this.actualizarServicioUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Servicio actualizado con éxito', servicio));
        } catch (error) {
            next(error);
        }
    }

    cambiarEstado = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { estado } = req.body;
            const servicio = await this.cambiarEstadoServicioUseCase.execute(id, negocio_id, estado);
            res.status(200).json(Respuesta.exito('Estado del servicio actualizado', servicio));
        } catch (error) {
            next(error);
        }
    }

    guardarFirmaEntrada = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            if (!req.file) throw new AppError('No se ha subido ninguna firma', 'SIGNATURE_REQUIRED', 400);
            const firma_url = req.file.path.replace(/\\/g, '/');
            const servicio = await this.guardarFirmaEntradaUseCase.execute(id, firma_url, negocio_id);
            res.status(200).json(Respuesta.exito('Firma de entrada registrada exitosamente', servicio));
        } catch (error) {
            next(error);
        }
    }

    subirImagen = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            if (!req.file) throw new AppError('No se ha subido ninguna imagen', 'IMAGE_REQUIRED', 400);
            const url = req.file.path.replace(/\\/g, '/');
            const descripcion = typeof req.body.descripcion === 'string' ? req.body.descripcion : null;
            console.log("esta es la descripccion", descripcion)
            const servicio = await this.subirImagenServicioUseCase.execute({ servicio_id: id, url, negocio_id, descripcion });
            res.status(201).json(Respuesta.exito('Imagen agregada al servicio', servicio));
        } catch (error) {
            next(error);
        }
    }

    subirImagenProgreso = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            if (!req.file) throw new AppError('No se ha subido ninguna imagen', 'IMAGE_REQUIRED', 400);
            const url = req.file.path.replace(/\\/g, '/');
            const descripcion = typeof req.body.descripcion === 'string' ? req.body.descripcion : null;
            const servicio = await this.subirImagenProgresoServicioUseCase.execute({ servicio_id: id, url, negocio_id, descripcion });
            res.status(201).json(Respuesta.exito('Imagen de progreso agregada al servicio', servicio));
        } catch (error) {
            next(error);
        }
    }

    actualizarTarea = async (req: Request<{ id: string; tarea_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id, tarea_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.actualizarTareaUseCase.execute(tarea_id, id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Tarea actualizada con éxito', null));
        } catch (error) {
            next(error);
        }
    }

    eliminarImagen = async (req: Request<{ id: string; imagen_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id, imagen_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarImagenServicioUseCase.execute(imagen_id, id, negocio_id);
            res.status(200).json(Respuesta.exito('Imagen eliminada del servicio', null));
        } catch (error) {
            next(error);
        }
    }

    listarChecklistRespuestas = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const respuestas = await this.listarChecklistRespuestasUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Respuestas del checklist obtenidas', respuestas));
        } catch (error) {
            next(error);
        }
    }

    registrarChecklistRespuesta = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const respuesta = await this.registrarChecklistRespuestaUseCase.execute({ ...req.body, servicio_id: id }, negocio_id);
            res.status(201).json(Respuesta.exito('Respuesta de checklist guardada', respuesta));
        } catch (error) {
            next(error);
        }
    }

    actualizarChecklistRespuesta = async (req: Request<{ id: string; respuesta_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id, respuesta_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const respuesta = await this.actualizarChecklistRespuestaUseCase.execute(respuesta_id, id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito('Respuesta de checklist actualizada', respuesta));
        } catch (error) {
            next(error);
        }
    }

    eliminarChecklistRespuesta = async (req: Request<{ id: string; respuesta_id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id, respuesta_id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarChecklistRespuestaUseCase.execute(respuesta_id, id, negocio_id);
            res.status(200).json(Respuesta.exito('Respuesta de checklist eliminada', null));
        } catch (error) {
            next(error);
        }
    }

    asociarCliente = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            if (!this.asociarClienteServicioUseCase) throw new AppError('Operación no disponible', 'NOT_IMPLEMENTED', 500);
            const servicio = await this.asociarClienteServicioUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito('Cliente asociado al servicio', servicio));
        } catch (error) {
            next(error);
        }
    }

    asociarMecanico = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { mecanico_id } = req.body;
            if (!this.asociarMecanicoServicioUseCase) throw new AppError('Operación no disponible', 'NOT_IMPLEMENTED', 500);
            const servicio = await this.asociarMecanicoServicioUseCase.execute(id, mecanico_id, negocio_id);
            res.status(200).json(Respuesta.exito('Mecánico asociado al servicio', servicio));
        } catch (error) {
            next(error);
        }
    }

    cambiarMecanico = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const { mecanicoAnteriorId, mecanicoNuevoId } = req.body;
            if (!this.cambiarMecanicoServicioUseCase) throw new AppError('Operación no disponible', 'NOT_IMPLEMENTED', 500);
            const servicio = await this.cambiarMecanicoServicioUseCase.execute(id, mecanicoAnteriorId, mecanicoNuevoId, negocio_id);
            res.status(200).json(Respuesta.exito('Mecánico cambiado en el servicio', servicio));
        } catch (error) {
            next(error);
        }
    }
}
