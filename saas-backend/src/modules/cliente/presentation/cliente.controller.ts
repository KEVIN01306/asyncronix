import type { NextFunction, Request, Response } from "express";
import BaseController from "../../../shared/presentation/base.controller.js";
import Respuesta from "../../../app/http/respuesta.js";
import type { ObtenerClienteUseCase } from "../application/obtener-cliente.usecase.js";
import type { ObtenerClientesUseCase } from "../application/obtener-clientes.js";
import type { RegistrarClienteUseCase } from "../application/registrar-cliente.usecase.js";
import type { ActualizarClienteUseCase } from "../application/actualizar-cliente.usecase.js";
import type { EliminarClienteUseCase } from "../application/eliminar-cliente.usecase.js";
import type { BuscarClientePorDocumentoUseCase } from "../application/buscar-cliente-por-documento.usecase.js";
import type { BuscarClienteGlobalUseCase } from "../application/buscar-cliente-global.usecase.js";
import type { ObtenerResumenUnificacionUseCase } from "../application/obtener-resumen-unificacion.usecase.js";
import type { UnificarClientesUseCase } from "../application/unificar-clientes.usecase.js";
import type { ReenviarCredencialesClienteUseCase } from "../application/reenviar-credenciales-cliente.usecase.js";

export class ClienteController extends BaseController {
    constructor(
        private readonly obtenerClienteUseCase: ObtenerClienteUseCase,
        private readonly obtenerClientesUseCase: ObtenerClientesUseCase,
        private readonly registrarClienteUseCase: RegistrarClienteUseCase,
        private readonly actualizarClienteUseCase: ActualizarClienteUseCase,
        private readonly eliminarClienteUseCase: EliminarClienteUseCase,
        private readonly buscarClientePorDocumentoUseCase: BuscarClientePorDocumentoUseCase,
        private readonly buscarClienteGlobalUseCase: BuscarClienteGlobalUseCase,
        private readonly obtenerResumenUnificacionUseCase: ObtenerResumenUnificacionUseCase,
        private readonly unificarClientesUseCase: UnificarClientesUseCase,
        private readonly reenviarCredencialesClienteUseCase: ReenviarCredencialesClienteUseCase
    ) {
        super();
    }

    obtener = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const cliente = await this.obtenerClienteUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito("Cliente obtenido con éxito", cliente));
        } catch (error) {
            next(error);
        }
    };

    buscarPorDocumento = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { nit, dpi, soloNegocio } = res.locals.query;
            const cliente = await this.buscarClientePorDocumentoUseCase.execute(
                { nit, dpi },
                negocio_id,
                soloNegocio
            );
            res.status(200).json(Respuesta.exito("Búsqueda de cliente completada", cliente));
        } catch (error) {
            next(error);
        }
    };

    buscarPorNit = async (req: Request<{ nit: string }>, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { nit } = req.params;
            const cliente = await this.buscarClientePorDocumentoUseCase.execute(
                { nit, dpi: null },
                negocio_id,
                false
            );
            res.status(200).json(Respuesta.exito("Búsqueda de cliente por NIT completada", cliente));
        } catch (error) {
            next(error);
        }
    };

    buscarPorDpi = async (req: Request<{ dpi: string }>, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { dpi } = req.params;
            const cliente = await this.buscarClientePorDocumentoUseCase.execute(
                { nit: null, dpi },
                negocio_id,
                false
            );
            res.status(200).json(Respuesta.exito("Búsqueda de cliente por DPI completada", cliente));
        } catch (error) {
            next(error);
        }
    };

    buscarGlobal = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { q, documento, limit } = res.locals.query;
            const clientes = await this.buscarClienteGlobalUseCase.execute({ q, documento, limit });
            res.status(200).json(Respuesta.exito("Búsqueda global de clientes completada", clientes));
        } catch (error) {
            next(error);
        }
    };

    listar = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { limit, offset, q, documento } = res.locals.query;
            const page = Math.floor(offset / limit) + 1;
            const { total, data } = await this.obtenerClientesUseCase.execute({
                negocio_id,
                page,
                perPage: limit,
                q,
                documento
            });
            res.status(200).json(Respuesta.paginacion("Clientes obtenidos con éxito", data, total, limit, offset));
        } catch (error) {
            next(error);
        }
    };

    registrar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const cliente = await this.registrarClienteUseCase.execute(req.body, negocio_id);
            const mensaje = cliente.reutilizado
                ? "Cliente existente encontrado y vinculado al negocio"
                : "Cliente creado con éxito y credenciales generadas";
            res.status(201).json(Respuesta.exito(mensaje, cliente));
        } catch (error) {
            next(error);
        }
    };

    actualizar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const cliente = await this.actualizarClienteUseCase.execute(id, negocio_id, req.body);
            res.status(200).json(Respuesta.exito("Cliente actualizado con éxito", cliente));
        } catch (error) {
            next(error);
        }
    };

    eliminar = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            await this.eliminarClienteUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito("Cliente eliminado con éxito", null));
        } catch (error) {
            next(error);
        }
    };

    resumenUnificacion = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { negocio_id } = this.obtenerEntorno(res);
            const { origen_id, destino_id } = res.locals.query;
            const resumen = await this.obtenerResumenUnificacionUseCase.execute(
                origen_id,
                destino_id,
                negocio_id
            );
            res.status(200).json(Respuesta.exito("Resumen de unificación generado", resumen));
        } catch (error) {
            next(error);
        }
    };

    unificar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const entorno = this.obtenerEntorno(res);
            const { cliente_conservar_id, cliente_eliminar_id, datos_fusionados, adoptar_datos_faltantes } = req.body;

            const resultado = await this.unificarClientesUseCase.execute({
                clienteConservarId: cliente_conservar_id,
                clienteEliminarId: cliente_eliminar_id,
                negocioId: entorno.negocio_id,
                usuarioId: entorno.id,
                adoptarDatosFaltantes: adoptar_datos_faltantes !== undefined ? Boolean(adoptar_datos_faltantes) : true,
                datosFusionadosSobrescritos: datos_fusionados
            });

            res.status(200).json(Respuesta.exito("Clientes unificados correctamente", resultado));
        } catch (error) {
            next(error);
        }
    };

    reenviarCredenciales = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { negocio_id } = this.obtenerEntorno(res);
            const resultado = await this.reenviarCredencialesClienteUseCase.execute(id, negocio_id);
            res.status(200).json(Respuesta.exito("Nuevas credenciales generadas y enviadas con éxito", resultado));
        } catch (error) {
            next(error);
        }
    };
}
